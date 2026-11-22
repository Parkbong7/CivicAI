import pytest
from services.eligibility_service import eligibility_service

def test_eligible_applicant_passes_all_checks(sample_eligible_applicant, sample_scholarship_scheme):
    result = eligibility_service.evaluate(sample_eligible_applicant, sample_scholarship_scheme)

    assert result.is_eligible is True
    assert result.overall_status == "ELIGIBLE"
    assert len(result.missing_fields) == 0
    assert "successfully meets" in result.summary_explanation.lower()

def test_ineligible_applicant_fails_income_and_gpa(sample_ineligible_applicant, sample_scholarship_scheme):
    result = eligibility_service.evaluate(sample_ineligible_applicant, sample_scholarship_scheme)

    assert result.is_eligible is False
    assert result.overall_status == "INELIGIBLE"
    # Verify failed conditions
    failed_conditions = [c for c in result.conditions if c.status == "FAILED"]
    assert len(failed_conditions) >= 1
    failed_names = [c.rule_name for c in failed_conditions]
    assert "Annual Family Income Ceiling" in failed_names

def test_missing_income_results_in_needs_more_info(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["annual_income"] = None

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is False
    assert result.overall_status == "NEEDS_MORE_INFO"
    assert "annual_income" in result.missing_fields

def test_missing_gpa_results_in_needs_more_info(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["gpa_percentage"] = None

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is False
    assert result.overall_status == "NEEDS_MORE_INFO"
    assert "gpa_percentage" in result.missing_fields

def test_boundary_value_exact_income_ceiling(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["annual_income"] = 250000  # Exact boundary

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is True
    assert result.overall_status == "ELIGIBLE"

def test_boundary_value_income_exceeds_by_one_rupee(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["annual_income"] = 250001  # 1 rupee over boundary

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is False
    assert result.overall_status == "INELIGIBLE"

def test_boundary_value_exact_gpa_cutoff(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["gpa_percentage"] = 6.0  # Exact boundary

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is True
    assert result.overall_status == "ELIGIBLE"

def test_percentage_based_academic_score(sample_eligible_applicant, sample_scholarship_scheme):
    applicant = dict(sample_eligible_applicant)
    applicant["gpa_percentage"] = 72.5  # Percentage (> 10)

    result = eligibility_service.evaluate(applicant, sample_scholarship_scheme)

    assert result.is_eligible is True
    assert result.overall_status == "ELIGIBLE"

def test_gender_restricted_scheme_check(sample_eligible_applicant):
    girl_scholarship_scheme = {
        "id": "aicte-pragati-2026",
        "title": "AICTE Pragati Scholarship for Girl Students",
        "eligibility_rules": {
            "max_annual_income": 800000,
            "min_gpa": 6.0,
            "gender": "Female"
        }
    }

    # Female applicant -> passes
    female_result = eligibility_service.evaluate(sample_eligible_applicant, girl_scholarship_scheme)
    assert female_result.is_eligible is True

    # Male applicant -> fails gender condition
    male_applicant = dict(sample_eligible_applicant)
    male_applicant["gender"] = "Male"
    male_result = eligibility_service.evaluate(male_applicant, girl_scholarship_scheme)
    assert male_result.is_eligible is False
    assert male_result.overall_status == "INELIGIBLE"

def test_empty_or_malformed_rules_handled_gracefully(sample_eligible_applicant):
    scheme_with_no_rules = {
        "id": "generic-scheme",
        "title": "General Scheme",
        "eligibility_rules": "{malformed json...}"
    }

    result = eligibility_service.evaluate(sample_eligible_applicant, scheme_with_no_rules)
    assert result is not None
    assert result.overall_status in ["ELIGIBLE", "NEEDS_MORE_INFO"]

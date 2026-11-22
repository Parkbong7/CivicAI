import json
from typing import Dict, Any, List
from models.applicant import EligibilityResult, EligibilityCondition

class EligibilityService:
    @staticmethod
    def evaluate(applicant: Dict[str, Any], scheme: Dict[str, Any]) -> EligibilityResult:
        rules = scheme.get("eligibility_rules", {})
        if isinstance(rules, str):
            try:
                rules = json.loads(rules)
            except Exception:
                rules = {}

        conditions: List[EligibilityCondition] = []
        missing_fields: List[str] = []
        all_passed = True
        has_pending = False

        # 1. Income Check
        max_income = rules.get("max_annual_income")
        actual_income = applicant.get("annual_income")
        if max_income is not None:
            if actual_income is None:
                has_pending = True
                missing_fields.append("annual_income")
                conditions.append(EligibilityCondition(
                    rule_name="Annual Family Income Ceiling",
                    required_value=f"<= INR {max_income:,} per annum",
                    actual_value="Not provided",
                    status="PENDING_INFO",
                    explanation="Annual family income certificate is mandatory to determine financial eligibility."
                ))
            elif float(actual_income) <= float(max_income):
                conditions.append(EligibilityCondition(
                    rule_name="Annual Family Income Ceiling",
                    required_value=f"<= INR {max_income:,} per annum",
                    actual_value=f"INR {int(actual_income):,}",
                    status="PASSED",
                    explanation=f"Applicant's income of INR {int(actual_income):,} is below the scheme ceiling of INR {max_income:,}."
                ))
            else:
                all_passed = False
                conditions.append(EligibilityCondition(
                    rule_name="Annual Family Income Ceiling",
                    required_value=f"<= INR {max_income:,} per annum",
                    actual_value=f"INR {int(actual_income):,}",
                    status="FAILED",
                    explanation=f"Applicant's income of INR {int(actual_income):,} exceeds the maximum limit of INR {max_income:,}."
                ))

        # 2. Academic Score / GPA Check
        min_gpa = rules.get("min_gpa", 6.0)
        min_pct = rules.get("min_percentage", 55.0)
        actual_score = applicant.get("gpa_percentage")

        if actual_score is None:
            has_pending = True
            missing_fields.append("gpa_percentage")
            conditions.append(EligibilityCondition(
                rule_name="Minimum Academic Performance",
                required_value=f">= {min_gpa} CGPA or {min_pct}%",
                actual_value="Not provided",
                status="PENDING_INFO",
                explanation="Academic score / marksheet is required to verify merit qualification."
            ))
        else:
            score = float(actual_score)
            passed = (score >= min_gpa if score <= 10 else score >= min_pct)
            if passed:
                conditions.append(EligibilityCondition(
                    rule_name="Minimum Academic Performance",
                    required_value=f">= {min_gpa} CGPA or {min_pct}%",
                    actual_value=f"{score} {'CGPA' if score <= 10 else '%'}",
                    status="PASSED",
                    explanation=f"Applicant's academic record satisfies the minimum threshold of {min_gpa} CGPA / {min_pct}%."
                ))
            else:
                all_passed = False
                conditions.append(EligibilityCondition(
                    rule_name="Minimum Academic Performance",
                    required_value=f">= {min_gpa} CGPA or {min_pct}%",
                    actual_value=f"{score} {'CGPA' if score <= 10 else '%'}",
                    status="FAILED",
                    explanation=f"Score of {score} is below the qualifying threshold ({min_gpa} CGPA / {min_pct}%)."
                ))

        # 3. Gender Requirement Check (e.g. Pragati scheme)
        required_gender = rules.get("gender")
        if required_gender:
            actual_gender = applicant.get("gender")
            if not actual_gender:
                has_pending = True
                missing_fields.append("gender")
                conditions.append(EligibilityCondition(
                    rule_name="Gender Criterion",
                    required_value=required_gender,
                    actual_value="Not specified",
                    status="PENDING_INFO",
                    explanation=f"This scheme is exclusively designated for {required_gender} candidates."
                ))
            elif actual_gender.strip().lower() == required_gender.strip().lower():
                conditions.append(EligibilityCondition(
                    rule_name="Gender Criterion",
                    required_value=required_gender,
                    actual_value=actual_gender,
                    status="PASSED",
                    explanation=f"Candidate meets the gender eligibility requirement ({required_gender})."
                ))
            else:
                all_passed = False
                conditions.append(EligibilityCondition(
                    rule_name="Gender Criterion",
                    required_value=required_gender,
                    actual_value=actual_gender,
                    status="FAILED",
                    explanation=f"This scheme is restricted to {required_gender} applicants."
                ))

        # 4. Enrollment Check
        college = applicant.get("college_name")
        if not college:
            has_pending = True
            missing_fields.append("college_name")
            conditions.append(EligibilityCondition(
                rule_name="Recognized Institution Enrollment",
                required_value="Recognized College / University",
                actual_value="Not specified",
                status="PENDING_INFO",
                explanation="Applicant must be enrolled in an accredited higher education institution."
            ))
        else:
            conditions.append(EligibilityCondition(
                rule_name="Recognized Institution Enrollment",
                required_value="Recognized College / University",
                actual_value=college,
                status="PASSED",
                explanation=f"Applicant is actively enrolled at '{college}'."
            ))

        # Overall Status
        if not all_passed:
            overall_status = "INELIGIBLE"
            is_eligible = False
            summary = "Applicant does not satisfy one or more statutory eligibility criteria for this scheme."
        elif has_pending:
            overall_status = "NEEDS_MORE_INFO"
            is_eligible = False
            summary = f"Eligibility cannot be confirmed yet. Please provide: {', '.join(missing_fields)}."
        else:
            overall_status = "ELIGIBLE"
            is_eligible = True
            summary = "Applicant successfully meets all statutory criteria and is fully eligible to apply."

        return EligibilityResult(
            is_eligible=is_eligible,
            overall_status=overall_status,
            scheme_id=scheme.get("id", "nsp-pms-2026"),
            scheme_title=scheme.get("title", "Post-Matric Scholarship Scheme"),
            conditions=conditions,
            missing_fields=missing_fields,
            summary_explanation=summary
        )

eligibility_service = EligibilityService()

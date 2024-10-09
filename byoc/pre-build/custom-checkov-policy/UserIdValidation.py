from checkov.common.models.enums import CheckCategories, CheckResult
from checkov.dockerfile.base_dockerfile_check import BaseDockerfileCheck

class UserIdValidation(BaseDockerfileCheck):
    def __init__(self):
        name = "Ensure USER is set to a value between 10000 and 20000 (Eg. USER 10001)"
        id = "CKV_CHOREO_1"
        supported_instructions = ['USER']
        categories = [CheckCategories.IAM]
        super().__init__(name=name, id=id, categories=categories,
                         supported_instructions=supported_instructions)

    def scan_entity_conf(self, conf):
        try:
            user_id = int(conf[-1]["value"])
            if user_id >= 10_000 and user_id <= 20_000:
                return CheckResult.PASSED, None, None
            return CheckResult.FAILED, None
        except:
            return CheckResult.FAILED, None

check = UserIdValidation()
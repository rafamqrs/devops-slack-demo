@IsTest
private class DevOpsWebhookRestTest {

    @IsTest
    static void testHandleWebhook() {
        String payload = '{"action":"opened","pull_request":{"number":42,"title":"feat: test","user":{"login":"tester"},"html_url":"https://github.com/t/r/pull/42","additions":10,"deletions":2,"changed_files":3,"labels":[]},"repository":{"full_name":"test-org/test-repo"}}';

        RestRequest req = new RestRequest();
        req.requestURI = '/services/apexrest/devops/webhook';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf(payload);
        RestContext.request = req;
        RestContext.response = new RestResponse();

        Test.startTest();
        String result = DevOpsWebhookRest.handleWebhook();
        Test.stopTest();

        System.assert(result.contains('"status":"published"'), 'Expected published status, got: ' + result);
        System.assert(result.contains('"pr":42'), 'Expected PR number 42');
    }

    @IsTest
    static void testHandleHotfixWebhook() {
        String payload = '{"action":"opened","pull_request":{"number":99,"title":"[HOTFIX] Fix critical","user":{"login":"dev"},"html_url":"https://github.com/t/r/pull/99","additions":5,"deletions":1,"changed_files":1,"labels":[]},"repository":{"full_name":"org/repo"}}';

        RestRequest req = new RestRequest();
        req.requestURI = '/services/apexrest/devops/webhook';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf(payload);
        RestContext.request = req;
        RestContext.response = new RestResponse();

        Test.startTest();
        String result = DevOpsWebhookRest.handleWebhook();
        Test.stopTest();

        System.assert(result.contains('"isHotfix":true'), 'Expected isHotfix true');
    }
}

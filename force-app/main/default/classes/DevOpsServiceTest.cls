@IsTest
private class DevOpsServiceTest {

    private class GitHubPRMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'application/json');

            if (req.getEndpoint().contains('/merge')) {
                res.setBody('{"sha":"abc123def456","merged":true,"message":"Pull Request successfully merged"}');
            } else {
                res.setBody('{"number":42,"title":"[HOTFIX] Fix critical bug","state":"open","additions":15,"deletions":3,"changed_files":2,"mergeable":true}');
            }
            return res;
        }
    }

    private class SlackMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success":true}');
            return res;
        }
    }

    @IsTest
    static void testReviewPullRequest() {
        Test.setMock(HttpCalloutMock.class, new GitHubPRMock());

        GitHubCalloutService.PRReviewRequest req = new GitHubCalloutService.PRReviewRequest();
        req.repoOwner = 'test-org';
        req.repoName = 'test-repo';
        req.pullNumber = 42;

        Test.startTest();
        List<GitHubCalloutService.PRReviewResult> results = GitHubCalloutService.reviewPullRequest(
            new List<GitHubCalloutService.PRReviewRequest>{ req }
        );
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals('[HOTFIX] Fix critical bug', results[0].prTitle);
        System.assertEquals(15, results[0].additions);
        System.assertEquals(3, results[0].deletions);
        System.assertEquals(2, results[0].changedFiles);
        System.assert(results[0].analysisResult.contains('PR #42'));
    }

    @IsTest
    static void testSendSlackMessage() {
        Test.setMock(HttpCalloutMock.class, new SlackMock());

        SlackNotificationService.SlackRequest req = new SlackNotificationService.SlackRequest();
        req.channel = '#devops-approvals';
        req.messageBody = 'Test message';
        req.includeButtons = true;
        req.prNumber = 42;
        req.repoFullName = 'test-org/test-repo';

        Test.startTest();
        List<SlackNotificationService.SlackResult> results = SlackNotificationService.sendMessage(
            new List<SlackNotificationService.SlackRequest>{ req }
        );
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals(true, results[0].success);
        System.assert(results[0].responseMessage.contains('#devops-approvals'));
    }

    @IsTest
    static void testMergePullRequest() {
        Test.setMock(HttpCalloutMock.class, new GitHubPRMock());

        GitHubMergeService.MergeRequest req = new GitHubMergeService.MergeRequest();
        req.repoOwner = 'test-org';
        req.repoName = 'test-repo';
        req.pullNumber = 42;
        req.commitTitle = 'Deploy approved by admin via Agentforce';

        Test.startTest();
        List<GitHubMergeService.MergeResult> results = GitHubMergeService.mergePullRequest(
            new List<GitHubMergeService.MergeRequest>{ req }
        );
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals(true, results[0].merged);
        System.assertEquals('abc123def456', results[0].sha);
        System.assert(results[0].deployResult.contains('PR #42'));
    }
}

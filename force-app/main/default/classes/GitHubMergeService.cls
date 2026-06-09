public with sharing class GitHubMergeService {

    private static final String NAMED_CREDENTIAL = 'callout:GitHub_API';

    @InvocableMethod(label='Trigger GitHub Action' description='Merges a PR to trigger deploy workflow')
    public static List<MergeResult> mergePullRequest(List<MergeRequest> requests) {
        List<MergeResult> results = new List<MergeResult>();

        for (MergeRequest req : requests) {
            HttpRequest httpReq = new HttpRequest();
            httpReq.setEndpoint(NAMED_CREDENTIAL + '/repos/' + req.repoOwner + '/' + req.repoName + '/pulls/' + req.pullNumber + '/merge');
            httpReq.setMethod('PUT');
            httpReq.setHeader('Accept', 'application/vnd.github.v3+json');
            httpReq.setHeader('Content-Type', 'application/json');
            httpReq.setHeader('User-Agent', 'Agentforce-DevOps');

            Map<String, Object> body = new Map<String, Object>{
                'commit_title' => req.commitTitle,
                'merge_method' => 'squash'
            };
            httpReq.setBody(JSON.serialize(body));

            Http http = new Http();
            HttpResponse res = http.send(httpReq);

            MergeResult result = new MergeResult();
            if (res.getStatusCode() == 200) {
                Map<String, Object> respBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.merged = true;
                result.sha = (String) respBody.get('sha');
                result.deployResult = 'PR #' + req.pullNumber + ' merged com sucesso. GitHub Actions deploy workflow iniciado.';
            } else {
                result.merged = false;
                result.deployResult = 'Erro ao fazer merge: HTTP ' + res.getStatusCode();
            }
            results.add(result);
        }
        return results;
    }

    public class MergeRequest {
        @InvocableVariable(required=true label='Repository Owner')
        public String repoOwner;
        @InvocableVariable(required=true label='Repository Name')
        public String repoName;
        @InvocableVariable(required=true label='Pull Request Number')
        public Integer pullNumber;
        @InvocableVariable(required=true label='Commit Title')
        public String commitTitle;
    }

    public class MergeResult {
        @InvocableVariable(label='Merged')
        public Boolean merged;
        @InvocableVariable(label='SHA')
        public String sha;
        @InvocableVariable(label='Deploy Result')
        public String deployResult;
    }
}

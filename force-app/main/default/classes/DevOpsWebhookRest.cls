@RestResource(urlMapping='/devops/webhook/*')
global with sharing class DevOpsWebhookRest {

    @HttpPost
    global static String handleWebhook() {
        RestRequest req = RestContext.request;
        Map<String, Object> payload = (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());

        Map<String, Object> pr = (Map<String, Object>) payload.get('pull_request');
        Map<String, Object> repo = (Map<String, Object>) payload.get('repository');

        String title = (String) pr.get('title');
        Boolean isHotfix = title.contains('[HOTFIX]');

        DevOps_Event__e evt = new DevOps_Event__e();
        evt.PR_Number__c = (Integer) pr.get('number');
        evt.PR_Title__c = title;
        evt.PR_Author__c = (String) ((Map<String, Object>) pr.get('user')).get('login');
        evt.PR_URL__c = (String) pr.get('html_url');
        evt.Repo_Full_Name__c = (String) repo.get('full_name');
        evt.Is_Hotfix__c = isHotfix;
        evt.Additions__c = pr.get('additions') != null ? (Integer) pr.get('additions') : 0;
        evt.Deletions__c = pr.get('deletions') != null ? (Integer) pr.get('deletions') : 0;
        evt.Changed_Files__c = pr.get('changed_files') != null ? (Integer) pr.get('changed_files') : 0;

        Database.SaveResult sr = EventBus.publish(evt);

        if (sr.isSuccess()) {
            return '{"status":"published","pr":' + evt.PR_Number__c + ',"isHotfix":' + isHotfix + '}';
        } else {
            return '{"status":"error","message":"' + sr.getErrors()[0].getMessage() + '"}';
        }
    }
}

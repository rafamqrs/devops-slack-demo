@IsTest
private class ChurnRiskControllerTest {

    @TestSetup
    static void setupTestData() {
        Account acc = new Account(
            Name = 'Test Corp',
            AnnualRevenue = 300000,
            NumberOfEmployees = 50
        );
        insert acc;

        List<Opportunity> opps = new List<Opportunity>();

        opps.add(new Opportunity(
            Name = 'High Risk Opp',
            AccountId = acc.Id,
            Amount = 150000,
            StageName = 'Negotiation/Review',
            CloseDate = Date.today().addDays(-5),
            Probability = 20
        ));

        opps.add(new Opportunity(
            Name = 'Medium Risk Opp',
            AccountId = acc.Id,
            Amount = 50000,
            StageName = 'Proposal/Price Quote',
            CloseDate = Date.today().addDays(3),
            Probability = 45
        ));

        opps.add(new Opportunity(
            Name = 'Low Risk Opp',
            AccountId = acc.Id,
            Amount = 25000,
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(30),
            Probability = 80
        ));

        insert opps;
    }

    @IsTest
    static void testHighRiskOpportunity() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'High Risk Opp' LIMIT 1];

        Test.startTest();
        ChurnRiskController.ChurnRiskResult result = ChurnRiskController.getChurnRisk(opp.Id);
        Test.stopTest();

        System.assertEquals('High', result.riskLevel, 'Expected High risk level');
        System.assert(result.riskScore >= 70, 'Expected risk score >= 70, got ' + result.riskScore);
        System.assert(result.recommendation.contains('Ação urgente'), 'Expected urgent recommendation');
    }

    @IsTest
    static void testMediumRiskOpportunity() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Medium Risk Opp' LIMIT 1];

        Test.startTest();
        ChurnRiskController.ChurnRiskResult result = ChurnRiskController.getChurnRisk(opp.Id);
        Test.stopTest();

        System.assertEquals('Medium', result.riskLevel, 'Expected Medium risk level');
        System.assert(result.riskScore >= 40 && result.riskScore < 70,
            'Expected risk score between 40-70, got ' + result.riskScore);
        System.assert(result.recommendation.contains('Atenção requerida'), 'Expected attention recommendation');
    }

    @IsTest
    static void testLowRiskOpportunity() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Low Risk Opp' LIMIT 1];

        Test.startTest();
        ChurnRiskController.ChurnRiskResult result = ChurnRiskController.getChurnRisk(opp.Id);
        Test.stopTest();

        System.assertEquals('Low', result.riskLevel, 'Expected Low risk level');
        System.assert(result.riskScore < 40, 'Expected risk score < 40, got ' + result.riskScore);
        System.assert(result.recommendation.contains('saudável'), 'Expected healthy recommendation');
    }

    @IsTest
    static void testNullFieldsHandling() {
        Account acc = [SELECT Id FROM Account WHERE Name = 'Test Corp' LIMIT 1];

        Opportunity opp = new Opportunity(
            Name = 'Null Fields Opp',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(60)
        );
        insert opp;

        Test.startTest();
        ChurnRiskController.ChurnRiskResult result = ChurnRiskController.getChurnRisk(opp.Id);
        Test.stopTest();

        System.assertNotEquals(null, result.riskLevel, 'Risk level should not be null');
        System.assertNotEquals(null, result.recommendation, 'Recommendation should not be null');
    }
}

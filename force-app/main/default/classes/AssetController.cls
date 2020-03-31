public with sharing class AssetController {
	@AuraEnabled(cacheable=true)
	public static List<Language__c> getLanguages(String searchLanguage) {
		String searchLanguageLike = '%' + searchLanguage + '%';
		List<Language__c> languages = [SELECT Id, Name, Label__c FROM Language__c WHERE Name LIKE :searchLanguageLike ORDER BY LastModifiedDate DESC];
		return languages;
	}

	@AuraEnabled(cacheable=true)
	public static List<Topic__c> getTopics(List<String> languageIdList, String searchTitle) {
		String searchTitleLike = '%' + searchTitle + '%';
		List<Topic__c> topics = [SELECT Id, Name,  Label__c , Title__c, Description__c FROM Topic__c  WHERE Language__c IN: languageIdList AND Title__c LIKE :searchTitleLike ORDER BY LastModifiedDate DESC];
		return topics;
	}

	@AuraEnabled(cacheable=true)
	public static List<Topic__c> getTopicsByLanguageId(String languageId, String searchTitle) {
		String searchTitleLike = '%' + searchTitle + '%';
		List<Topic__c> topics = [SELECT Id, Name, Label__c, Title__c FROM Topic__c  WHERE Language__c =: languageId AND Title__c LIKE :searchTitleLike ORDER BY LastModifiedDate DESC];
		return topics;
	}

	@AuraEnabled(cacheable=true)
	public static List<Project__c> getProjects(String searchProject) {
		String searchProjectLike = '%' + searchProject + '%';
		List<Project__c> projects = [SELECT Id, Name, Label__c FROM Project__c WHERE Name LIKE :searchProjectLike ORDER BY LastModifiedDate DESC];
		return projects;
	}

	@AuraEnabled(cacheable=true)
	public static Map<Id, Project_Topic__c> getProjectTopicsByProjectId(String projectId,String searchProjectTopic) {
		String searchProjectTopicLike = '%' + searchProjectTopic + '%';
		Map<Id, Project_Topic__c> projectTopics = new Map<Id, Project_Topic__c>([SELECT Id, Name, Project__c, Topic__c, Selected__c, Topic__r.Title__c, Topic__r.Description__c, Topic__r.Label__c FROM Project_Topic__c  WHERE Project__c =: projectId AND Topic__r.Title__c LIKE :searchProjectTopicLike ORDER BY CreatedDate DESC]);
		return projectTopics;
	}

	@AuraEnabled(cacheable=true)
	public static List<Project_Topic__c> getProjectTopicsByProjectIdAndLanguageId(String projectId, String languageId) {
		List<Project_Topic__c> projectTopics = [SELECT Id, Topic__c FROM Project_Topic__c  WHERE Project__c =: projectId AND Topic__r.Language__c =: languageId ORDER BY Topic__r.LastModifiedDate DESC];
		return projectTopics;
	}

	@AuraEnabled(cacheable=true)
	public static List<Topic__c> getTopicsByLanguageIdNotInProject(String projectId, String languageId ,String searchTitle) {
		String searchTitleLike = '%' + searchTitle + '%';
		List<Topic__c> topics = [SELECT Id, Name, Title__c FROM Topic__c  WHERE Language__c =: languageId AND Title__c LIKE :searchTitleLike  AND Id NOT IN (SELECT Topic__c FROM Project_Topic__c WHERE Project__c =: projectId) ORDER BY LastModifiedDate DESC];
		return topics;
	}

	@AuraEnabled()
	public static List<Project_Topic__c> createProjectTopics(String projectId, List<String> topicIdList, Boolean insertRecords) {
		List<Project_Topic__c> projectTopicList =  new List<Project_Topic__c>();
		if(insertRecords)
		{
			for(String topicId  : topicIdList){
			projectTopicList.add(new Project_Topic__c(Project__c = projectId,
			Topic__c = topicId));
			}
			if(projectTopicList.size() > 0){
				insert projectTopicList;
			}
		}
		return projectTopicList;
	}
}
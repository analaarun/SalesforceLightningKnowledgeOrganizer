({
getData : function(cmp) {
		// var searchLanguage = cmp.find("searchLanguage").get("v.value");
		var searchLanguage = cmp.get("v.searchLanguageByString");
		var action = cmp.get('c.getLanguages');
		action.setParam("searchLanguage", searchLanguage);
		action.setCallback(this, $A.getCallback(function (response) {
		var state = response.getState();
		if (state === "SUCCESS") {
			cmp.set('v.mydata', response.getReturnValue());
		} else if (state === "ERROR") {
			var errors = response.getError();
			console.error(errors);
		}
		}));
		$A.enqueueAction(action);
	},
getTopics : function(cmp, event){
		// var selectedRows = event.getParam('selectedRows');
		var languageIdList = cmp.get('v.languageIdList');
		var searchTitle = cmp.find("searchTitle").get("v.value");
		var action = cmp.get('c.getTopics');
		action.setParam("languageIdList", languageIdList);
		action.setParam("searchTitle", searchTitle);
		action.setCallback(this, $A.getCallback(function (response) {
		var state = response.getState();
		if (state === "SUCCESS") {
			cmp.set('v.topicData', response.getReturnValue());
		} else if (state === "ERROR") {
			var errors = response.getError();
			console.error(errors);
		}
		}));
		$A.enqueueAction(action);
	},

validateTopicForm: function(component) {
        var validTopic = true;

         // Show error messages if required fields are blank
        var allValid = component.find('TopicField').reduce(function (validFields, inputCmp) {
            inputCmp.showHelpMessageIfInvalid();
            return validFields && inputCmp.get('v.validity').valid;
        }, true);

        if (allValid) {
            // Verify we have an account to attach it to
            // var account = component.get("v.account");
            // if($A.util.isEmpty(account)) {
            //     validTopic = false;
            //     console.log("Quick action context doesn't have a valid account.");
            // }
        	return(validTopic);
            
        }  
	}
})
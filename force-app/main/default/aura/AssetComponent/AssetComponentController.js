({
	init: function (cmp, event, helper) {
		var headerActions = [
            {
                label: 'New Lang',
                checked: false,
                name:'newLang'
            }
        ];
        var langActions = [
			{ label: 'New Topic', name: 'newTopic' }
			];

		cmp.set('v.mycolumns', [
			{label: 'Language', fieldName: 'Name', type: 'text', actions: headerActions},
			{type: 'action', typeAttributes: { rowActions: langActions } }
			// {label: 'Phone', fieldName: 'Phone', type: 'phone'},
			// {label: 'Email', fieldName: 'Email', type: 'email'}
			]);
		var actions = [
			{ label: 'Edit Topic', name: 'editTopic' },
			{ label: 'Navigate', name: 'navigate' }
			];
		cmp.set('v.topicColumns', [
			{label: 'Title', fieldName: 'Title__c', type: 'text'},
			{ type: 'action', typeAttributes: { rowActions: actions } }
			// {label: 'Phone', fieldName: 'Phone', type: 'phone'},
			// {label: 'Email', fieldName: 'Email', type: 'email'}
			]);

		helper.getData(cmp);

		// Prepare a new record from template
        // cmp.find('topicRecordHandler').getNewRecord("Topic__c", // sObject type (objectApiName)
        //     null,      // recordTypeId
        //     false,     // skip cache?
        //     $A.getCallback(function() {
        //         var rec = cmp.get('v.newTopic');
        //         var error = cmp.get('v.newTopicError');
        //         if(error || (rec === null)) {
        //             console.log('Error initializing record template: ' + error);
        //             return;
        //         }
        //         console.log('Record template initialized: ' + rec.sobjectType);
        //     })
        // );
	},
	handleSelect: function (cmp, event, helper) {
		console.log(cmp.get('v.selectedRows'));
	},
	getSelectedName: function (cmp, event, helper) {
		var selectedRows = event.getParam('selectedRows');
	// Display that fieldName of the selected rows
		var languageIdList = [];
		// console.log(selectedRows);
		for (var i = 0; i < selectedRows.length; i++){
			console.log("You selected: " + selectedRows[i].Name + " - " + selectedRows[i].Id);
			languageIdList.push(selectedRows[i].Id);
		}
		cmp.set('v.languageIdList', languageIdList);
		cmp.find("searchTitle").set("v.value",'');
		helper.getTopics(cmp, event);
	},
	handleRowAction: function (cmp, event, helper) {
			var action = event.getParam('action');
			var row = event.getParam('row');
			console.log('Logging from handleRowAction controller js');
			console.log(action);
			console.log(row);
			switch (action.name) {
				case 'navigate':
				var navEvt = $A.get("e.force:navigateToSObject");
				navEvt.setParams({
				"recordId": row.Id,
				"slideDevName": "detail"
				});
				navEvt.fire();
				break;
    		}
		},
	// getSelectedTopicName: function (cmp, event, helper){
	// 	var selectedRows = event.getParam('selectedRows');
	// }
	searchTopic: function (cmp, event, helper) {
		// var searchTitle = cmp.find("searchTitle").get("v.value");
		var searchTitle = cmp.get("v.searchTitleByString");
		console.log(searchTitle); //returns true
		helper.getTopics(cmp, event);
	},
	searchLanguageByName: function(cmp, event, helper){
		helper.getData(cmp);
	},
	handleRowSelectionInTopicTable: function(cmp, event, helper){
		var selectedRows = event.getParam('selectedRows');
		var lastSelectedTopicTitle = cmp.get('v.lastSelectedTopicTitle');
		// console.log('logging from handleRowSelectionInTopicTable');
		// console.log(selectedRows[selectedRows.length -1]);
		if(selectedRows.length == 0){
			return;
		}
		if(selectedRows.length > 2){
			// console.log('Inside the if condition. selectedRows.length > 2');
			cmp.find('searchTitleTable').set('v.selectedRows',[]);
			return;
		}
		if(selectedRows.length > 1)
		{
			// console.log('Inside the if condition. selectedRows.length > 1');
			for(var i = 0 ; i < selectedRows.length ; i++)
			{
				if(selectedRows[i].Title__c == lastSelectedTopicTitle)
				{
					selectedRows.splice(i, 1);
				}
			}
			cmp.find('searchTitleTable').set('v.selectedRows',[]);
		}
		lastSelectedTopicTitle = selectedRows[0].Title__c;
		cmp.find('topicRecordHandler').set('v.recordId', selectedRows[0].Id);
		cmp.find('topicRecordHandler').reloadRecord();
		cmp.set('v.lastSelectedTopicTitle',lastSelectedTopicTitle);
		var topicDescription= cmp.find("topicDescription");
		topicDescription.set('v.title', selectedRows[0].Title__c);
		// topicDescription.set('v.value', selectedRows[0].Description__c);

	// Display that fieldName of the selected rows
		// var languageIdList = [];
		// // console.log(selectedRows);
		// for (var i = 0; i < selectedRows.length; i++){
		// 	console.log("You selected: " + selectedRows[i].Name + " - " + selectedRows[i].Id);
		// 	languageIdList.push(selectedRows[i].Id);
		// }
		// cmp.set('v.languageIdList', languageIdList);
		// cmp.find("searchTitle").set("v.value",'');
		// helper.getTopics(cmp, event);
	},
	navigateToRecord : function(component , event, helper){
    window.open('/' + event.getParam('recordId'));  
},

handleSaveTopic: function(component, event, helper) {
        if(helper.validateTopicForm(component)) {
            // component.set("v.simpleNewtopic.AccountId", component.get("v.recordId"));
            component.find("topicRecordCreator").saveRecord(function(saveResult) {
                if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                    // record is saved successfully
                    var resultsToast = $A.get("e.force:showToast");
                    resultsToast.setParams({
                        "title": "Saved",
                        "message": "The record was saved."
                    });
                    resultsToast.fire();

                } else if (saveResult.state === "INCOMPLETE") {
                    // handle the incomplete state
                    console.log("User is offline, device doesn't support drafts.");
                } else if (saveResult.state === "ERROR") {
                    // handle the error state
                    console.log('Problem saving topic, error: ' + JSON.stringify(saveResult.error));
                } else {
                    console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
                }
            });
        }
    },

    handleTopicSaveRecord: function(component, event, helper) {
    	console.log('Inside the function handleTopicSaveRecord');

    	// component.find("topicRecordHandler").get('v.recordId') != ''
    	if( component.find("topicDescription").get('v.value') != '')
    	{
    		component.set('v.showRecordSavingIcon', 1);
    		console.log('Inside the if condition of the function handleTopicSaveRecord');
    		var topicRecordHandler = component.find("topicRecordHandler");
    		topicRecordHandler.set('v.targetFields.Description__c', component.find("topicDescription").get('v.value'));
    		// component.set()
    		// component.find("topicRecordHandler").set('v.simpleNewtopic.Description__c', component.find("topicDescription").get('v.value'));	
    		console.log(component.find("topicRecordHandler"));
    		component.find("topicRecordHandler").saveRecord($A.getCallback(function(saveResult) {
            // NOTE: If you want a specific behavior(an action or UI behavior) when this action is successful 
            // then handle that in a callback (generic logic when record is changed should be handled in recordUpdated event handler)
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                // handle component related logic in event handler
                component.set('v.showRecordSavingIcon', 0);
            } else if (saveResult.state === "INCOMPLETE") {
                console.log("User is offline, device doesn't support drafts.");
                component.set('v.showRecordErrorIcon', 1);
            } else if (saveResult.state === "ERROR") {
                console.log('Problem saving record, error: ' + JSON.stringify(saveResult.error));
                component.set('v.showRecordErrorIcon', 1);
            } else {
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
                component.set('v.showRecordErrorIcon', 1);
            }
         }));
    	}
        
    },
    /**
     * Control the component behavior here when record is changed (via any component)
     */
    handleTopicRecordUpdated: function(component, event, helper) {
    	console.log('Inside the handleTopicRecordUpdated function');
        var eventParams = event.getParams();
        if(eventParams.changeType === "CHANGED") {
            // get the fields that changed for this record
            var changedFields = eventParams.changedFields;
            console.log('Fields that are changed: ' + JSON.stringify(changedFields));
            // record is changed, so refresh the component (or other component logic)
            // var resultsToast = $A.get("e.force:showToast");
            // resultsToast.setParams({
            //     "title": "Saved",
            //     "message": "The record was updated."
            // });
            // resultsToast.fire();
            
        } else if(eventParams.changeType === "LOADED") {
            // record is loaded in the cache
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted and removed from the cache
        } else if(eventParams.changeType === "ERROR") {
            // there’s an error while loading, saving or deleting the record
        }

    },
     handleHeaderAction: function (cmp, event, helper) {
        // Retrieves the name of the selected filter
        var actionName = event.getParam('action').name;
        // Retrieves the current column definition
        // based on the selected filter
        var colDef = event.getParam('columnDefinition');
        var columns = cmp.get('v.mycolumns');
        var activeFilter = cmp.get('v.activeFilter');
        // console.log('Col Def');
        // console.log(colDef);
        // console.log('columns :')
        // console.log(columns);
        // console.log('activeFilter : ');
        // console.log(activeFilter);
        console.log('action : ');
        console.log(actionName);
        switch (actionName) {
				case 'newLang':
				console.log('This is under the switch case action.');
					 var createRecordEvent = $A.get("e.force:createRecord");
					    createRecordEvent.setParams({
					        "entityApiName": "Language__c"
					    });
					    createRecordEvent.fire();
				break;
    		}
        // if (actionName !== activeFilter) {
        //     var idx = columns.indexOf(colDef);
        //     // Update the column definition with the updated actions data
        //     var actions = columns[idx].actions;
        //     actions.forEach(function (action) {
        //         action.checked = action.name === actionName;
        //     });
        //     cmp.set('v.activeFilter', actionName);
        //     helper.updateBooks(cmp);
        //     cmp.set('v.mycolumns', columns);
        // }
    },
    handleLangRowAction: function (cmp, event, helper) {
        // Retrieves the name of the selected filter
        var actionName = event.getParam('action').name;
 		var row = event.getParam('row');
 		
        console.log('Row : ');
        console.log(row);
        console.log('Row ID: ');
        console.log(row.Id);
        console.log('action : ');
        console.log(actionName);
        switch (actionName) {
				case 'newTopic':
				console.log('This is under the switch case action.');
				break;
    		}
    
    }

})
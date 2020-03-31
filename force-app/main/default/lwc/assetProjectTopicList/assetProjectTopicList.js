import {
    LightningElement,
    api,
    track,
    wire
} from 'lwc';
import getProjectTopicsByProjectId from '@salesforce/apex/AssetController.getProjectTopicsByProjectId';
import getTopicsByLanguageIdNotInProject from '@salesforce/apex/AssetController.getTopicsByLanguageIdNotInProject';
import getProjectTopicsByProjectIdAndLanguageId from '@salesforce/apex/AssetController.getProjectTopicsByProjectIdAndLanguageId';
import PROJECT_TOPIC_OBJECT from '@salesforce/schema/Project_Topic__c';
import TOPIC_FIELD from '@salesforce/schema/Project_Topic__c.Topic__c';
import PROJECT_FIELD from '@salesforce/schema/Project_Topic__c.Project__c';
import {
    refreshApex
} from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    createRecord
} from 'lightning/uiRecordApi';

export default class AssetProjectTopicList extends LightningElement {
    @api projectId = '';
    @track searchTerm = '';
    @track searchTopicTerm = '';
    @track error;
    insertProjectTopics = false;
    @track selectedLanguageId = '';
    @track selectedTopicId = '';
    @track selectedProjectTopicId = '';
    @track projectTopics = [];
    @track projectTopicsByIdMap = {};
    @track selectedProjectTopicIds = [];
    @track searchProjectTopic = true;
    @track newProjectTopic = false;
    @track projectTopicOption = 'searchProjectTopic';
    @track topicsAvailable = [];
    @track topicsSelected = [];
    items = [];

    get projectTopicOptions() {
        return [{
                label: 'Search',
                value: 'searchProjectTopic'
            },
            {
                label: 'New',
                value: 'newProjectTopic'
            },
            {
                label: 'Refresh',
                value: 'refreshProjectTopic'
            },
        ];
    }

    @api refreshAfterSelectedChange() {
            return refreshApex(this.wiredProjectTopicsResult);
    }

    /** Wired Apex result so it can be refreshed programmatically */
    wiredProjectTopicsResult;

    @wire(getProjectTopicsByProjectId, {
        projectId: '$projectId',
        searchProjectTopic: '$searchTerm'
    })
    loadProjectTopics(result) {
        this.wiredProjectTopicsResult = result;
        if (result.data) {
            this.projectTopicsByIdMap = result.data;
            this.projectTopics = Object.values(this.projectTopicsByIdMap);
            this.error = undefined;
            this.highlightSelectedProjectTopics();
        } else if (result.error) {
            //handle error
            this.error = result.error;
            this.projectTopicsByIdMap = undefined;
            this.projectTopics = undefined;
        }
    }


    /** Wired Apex result so it can be refreshed programmatically */
    wireTopicsResult;

    @wire(getTopicsByLanguageIdNotInProject, {
        projectId: '$projectId',
        languageId: '$selectedLanguageId',
        searchTitle: '$searchTopicTerm'
    })
    loadTopics(result) {
        this.wireTopicsResult = result;
        if (result.data) {
            this.items = result.data;
            console.log(this.items.length);
            console.log('Fetching Topics Success for language ' + this.selectedLanguageId);
            console.log('Search term Topics ' + this.searchTopicTerm);
            console.log(this.items);
            this.items = [];
            this.topicsAvailable = [];
            for (let i = 0; i < result.data.length; i++) {
                this.topicsAvailable.push({
                    label: result.data[i].Title__c,
                    value: result.data[i].Id,
                });
            }
            this.error = undefined;
            console.log('Total  Topics Available');
            console.log(this.topicsAvailable.length);
        } else if (result.error) {
            //handle error
            console.log('Fetching Topics Error');
            console.log(result);
            this.error = result.error;
            this.topicsAvailable = [];
        }
    }

    /** Wired Apex result so it can be refreshed programmatically */
    wireProjectTopicsByLanguageResult;

    @wire(getProjectTopicsByProjectIdAndLanguageId, {
        projectId: '$projectId',
        languageId: '$selectedLanguageId'
    })
    loadProjectTopicsByLanguageResult(result) {
        this.wireProjectTopicsByLanguageResult = result;
        if (result.data) {
            this.topicsSelected = [];
            // for (let i = 0; i < result.data.length; i++) {
            //     this.topicsSelected.push(result.data[i].Topic__c);
            // }
            this.error = undefined;
            // console.log('Total  Topics Selected');
            // console.log(this.topicsSelected.length);
        } else if (result.error) {
            // //handle error
            // console.log('Fetching Topics Error');
            // console.log(result);
            this.error = result.error;
            // this.topicsSelected = [];
        }
    }

    // @wire(createProjectTopics, {
    //     projectId: '$projectId',
    //     topicIdList: '$topicsSelected'
    // })
    // loadProjectTopicWithLanguage(result) {
    //     if (result.data) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Success',
    //                 message: 'Project Topics created',
    //                 variant: 'success',
    //             }),
    //         );
    //         this.error = undefined;
    //     } else if (result.error) {
    //         //handle error
    //         this.error = result.error;
    //     }
    // }

    handleProjectTopicOptionChange(event) {
        this.projectTopicOption = event.target.value;

        switch (this.projectTopicOption) {
            case 'searchProjectTopic':
                this.searchProjectTopic = true;
                this.newProjectTopic = false;
                break;
            case 'newProjectTopic':
                this.searchProjectTopic = false;
                this.newProjectTopic = true;
                break;
            default:
                this.searchProjectTopic = true;
                this.newProjectTopic = false;
                this.projectTopicOption = 'searchProjectTopic';
                return refreshApex(this.wiredProjectTopicsResult);
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
    }

    handleSearchTopicChange(event) {
        this.searchTopicTerm = event.detail.value;
    }

    handleLanguageLookup(event) {
        this.selectedLanguageId = event.target.value;
        // return refreshApex(this.wireTopicsResult);

    }


    @api refreshProjectTopicsCache() {
        return refreshApex(this.wiredProjectTopicsResult);
    }

    handleClick(event) {
        // this.selectedTopicId = event.target.value;
        // const allButtons = this.template.querySelectorAll('lightning-button');
        // if (allButtons) {
        //     allButtons.forEach(button => {
        //         if (button.value == this.selectedTopicId) {
        //             button.variant = 'success';
        //         } else {
        //             button.variant = 'brand-outline';
        //         }

        //     });
        // }
        // const selectedTopicEvent = new CustomEvent('selecttopic', {
        //     detail: this.selectedTopicId
        // });
        // this.dispatchEvent(selectedTopicEvent);
    }

    handleSaveProjectTopicClick() {
        if ((this.projectId != '') &&
            (this.topicsSelected.length > 0)) {
            this.createProjectTopicWithLanguage();
        } else {
            return refreshApex(this.wiredProjectTopicsResult), refreshApex(this.wireTopicsResult);
        }
    }

    createProjectTopicWithLanguage() {
        const fields = {};
        fields[PROJECT_FIELD.fieldApiName] = this.projectId;
        fields[TOPIC_FIELD.fieldApiName] = this.topicsSelected[0];
        const recordInput = {
            apiName: PROJECT_TOPIC_OBJECT.objectApiName,
            fields
        };

        createRecord(recordInput)
            .then(topic => {
                this.selectedTopicId = topic.id;
                // this.topicOption = 'searchTopic';
                // this.newTopicName = '';
                // // this.searchTerm = '';
                // this.searchTopic = true;
                // this.newTopic = false;
                // const selectedTopicEvent = new CustomEvent('selecttopic', {
                //     detail: this.selectedTopicId
                // });
                // this.dispatchEvent(selectedTopicEvent);
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Success',
                //         message: 'Topic created',
                //         variant: 'success',
                //     }),
                // );
                // return refreshApex(this.wiredTopicsResult);
                this.error = undefined;
                this.topicsSelected.shift();
                this.handleSaveProjectTopicClick();
            })
            .catch(error => {
                this.error = error;
            });
    }

    handleSelectTopicsChange(event) {
        this.topicsSelected = event.detail.value;
    }

    highlightSelectedProjectTopics() {
        const allButtons = this.template.querySelectorAll('lightning-button');
        if (allButtons) {
            // console.log('projectTopicsByIdMap');
            // console.log(Object.keys(this.projectTopicsByIdMap));
            // console.log(allButtons.length);
            allButtons.forEach(button => {
                if (button.variant == 'success'){
                    //Do Nothing
                }
                else if (this.projectTopicsByIdMap[button.value]['Selected__c']) {
                    button.variant = 'brand';
                } else {
                    button.variant = 'brand-outline';
                }

            });
        }
    }

    handleClick(event) {
        this.selectedProjectTopicId = event.target.value;
        const allButtons = this.template.querySelectorAll('lightning-button');
        if (allButtons) {
            allButtons.forEach(button => {
                if (button.value == this.selectedProjectTopicId) {
                    button.variant = 'success';
                } else if (this.projectTopicsByIdMap[button.value]['Selected__c']) {
                    button.variant = 'brand';
                } else {
                    button.variant = 'brand-outline';
                }

            });
        }
        const selectedProjectTopicEvent = new CustomEvent('selectprojecttopic', {
            detail: this.projectTopicsByIdMap[this.selectedProjectTopicId]
        });
        this.dispatchEvent(selectedProjectTopicEvent);
    }

    renderedCallback() {
        this.highlightSelectedProjectTopics();
    }

}
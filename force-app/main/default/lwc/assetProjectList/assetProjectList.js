import { LightningElement, track , wire} from 'lwc';
import getProjects from '@salesforce/apex/AssetController.getProjects';
import {
    refreshApex
} from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    createRecord
} from 'lightning/uiRecordApi';
import PROJECT_OBJECT from '@salesforce/schema/Project__c';
import NAME_FIELD from '@salesforce/schema/Project__c.Name';

export default class AssetProjectList extends LightningElement {
    @track projectOption = 'searchProject';
    @track searchTerm = '';
    @track selectedProjectId = '';
    @track projects = [];
    @track searchProject = true;
    @track newProject = false;
    @track newProjectName = '';
    @track error;

    get projectOptions() {
        return [{
                label: 'Search',
                value: 'searchProject'
            },
            {
                label: 'New',
                value: 'newProject'
            },
            {
                label: 'Refresh',
                value: 'refreshProject'
            },
        ];
    }

    /** Wired Apex result so it can be refreshed programmatically */
    wiredProjectsResult;

    @wire(getProjects, {
        searchProject: '$searchTerm'
    })
    loadProjects(result) {
        this.wiredProjectsResult = result;
        if (result.data) {
            this.projects = result.data;
            this.error = undefined;
        } else if (result.error) {
            //handle error
            this.error = result.error;
            this.projects = undefined;
        }
    }

    handleProjectOptionChange(event) {
        this.projectOption = event.target.value;

        switch (this.projectOption) {
            case 'searchProject':
                this.searchProject = true;
                this.newProject = false;
                break;
            case 'newProject':
                this.searchProject = false;
                this.newProject = true;
                break;
            default:
                this.searchProject = true;
                this.newProject = false;
                this.projectOption = 'searchProject';
                return refreshApex(this.wiredProjectsResult);
        }
    }

    handleProjectNameChange(event) {
        this.newProjectName = event.target.value;
    }

    handleSaveProjectClick(event) {
        if (this.newProjectName != '') {
            this.createProject();
        }
    }

    createProject() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.newProjectName;
        const recordInput = {
            apiName: PROJECT_OBJECT.objectApiName,
            fields
        };
        createRecord(recordInput)
            .then(project => {
                this.selectedProjectId = project.id;
                this.projectOption = 'searchProject';
                this.newProjectName = '';
                this.searchProject = true;
                this.newProject = false;
                const selectedProjectEvent = new CustomEvent('selectproject', {
                    detail: this.selectedProjectId
                });
                this.dispatchEvent(selectedProjectEvent);
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Success',
                //         message: 'Project created',
                //         variant: 'success',
                //     }),
                // );
                return refreshApex(this.wiredProjectsResult);
            })
            .catch(error => {
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error creating record',
                //         message: error.body.message,
                //         variant: 'error',
                //     }),
                // );
                this.error = error;
            });
    }

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
    }

    handleClick(event) {
        this.selectedProjectId = event.target.value;
        const allButtons = this.template.querySelectorAll('lightning-button');
        if (allButtons) {
            allButtons.forEach(button => {
                if (button.value == this.selectedProjectId) {
                    button.variant = 'success';
                } else {
                    button.variant = 'brand-outline';
                }

            });
        }
        const selectedProjectEvent = new CustomEvent('selectproject', {
            detail: this.selectedProjectId
        });
        this.dispatchEvent(selectedProjectEvent);
    }

}
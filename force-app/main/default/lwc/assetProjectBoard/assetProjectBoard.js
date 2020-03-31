import { LightningElement, track } from 'lwc';

export default class AssetProjectBoard extends LightningElement {
    @track projectId = '';
    @track projectTopic = {};

    handleSelectProject(event) {
        this.projectId = event.detail;
    }

    handleSelectProjectTopic(event){
        this.projectTopic = event.detail;
    }

    handleUpdateSelected(event){
       this.template.querySelector('c-asset-project-topic-list').refreshAfterSelectedChange();
    }

    handleDeleteProjectTopicEvent(event){
        this.projectTopic = {};
        this.template.querySelector('c-asset-project-topic-list').refreshAfterSelectedChange();
    }
}
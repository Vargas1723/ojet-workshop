import * as ko from "knockout";
import * as AccUtils from "../accUtils";
import ArrayListDataProvider = require("ojs/ojarraydataprovider");
import "ojs/ojknockout";
import "ojs/ojlistview";
import "ojs/ojlistitemlayout";

import ArrayDataProvider = require("ojs/ojarraydataprovider");
import { event } from "@oracle/oraclejet/dist/types/ojvcomponent-element";
import { ojListView } from "ojs/ojlistview";

import "ojs/ojlabel";
import "ojs/ojinputtext";
import "ojs/ojformlayout";


import UserService from '../service/dashboard.service';
import { KeySetImpl } from "ojs/ojkeyset";

import "ojs/ojselectcombobox";
import "ojs/ojcheckboxset";
import "ojs/ojbutton";
import { ojButtonEventMap } from "ojs/ojbutton";
import { ojOption, ojOptionEventMap } from "@oracle/oraclejet/dist/types/ojoption";
import { ojInputTextEventMap } from "ojs/ojinputtext";





interface UserData {
  id: number;
  name: String;
  done: String;
}

class DashboardViewModel {

  private selectedId;
  // Service
  private readonly userService: UserService = new UserService();


  private userData: ko.ObservableArray<UserData>;
  public dataProvider: ArrayDataProvider<UserData['name'], UserData>;
  
  // List view attributes
  public selectionMode: ko.Observable<string>;

  // Text
  public userListTitle: ko.Observable<string>;
  public userFormTitle: ko.Observable<string>;

  // Form
  public newName: ko.Observable<string>;
  public newStatus: ko.Observable<string>;
  // todos
  public newTask: ko.Observable<string>;
  public activatedButton: ko.Observable<string>;
  public inputTask: ojOption;
  public allTaskCompleted: boolean;
    
  
  
  constructor() {

    
    this.getUserData();
    // First create an options object with the minimum fields
    this.userData = ko.observableArray([]);
    this.dataProvider = new ArrayDataProvider(this.userData, {
      keyAttributes: 'id'
    });

    // List view attributes
    this.selectionMode = ko.observable('single');

    this.userListTitle = ko.observable('Tasks');
    this.userFormTitle = ko.observable('Task modify');

    // Form
    this.newName = ko.observable('');
    this.newStatus = ko.observable('');
    
    this.selectedId = null;

    // TODO
    this.newTask = ko.observable('');
    this.activatedButton = ko.observable('(None activated yet)');
    this.allTaskCompleted = false;
    

    
    
  }
  public getDisplayValue(set: KeySetImpl<number>) {
    return (Array.from(set.values()));
  }

  

  public handleSelectionChange = (event: ojListView.selectionChanged<UserData['id'], UserData>) => {
    console.log("test");
    if(this.getDisplayValue(event.detail.value as unknown as KeySetImpl<number>)[0] === undefined){
      console.log("unselect");
      this.newName('');
      this.newStatus('');
      this.selectedId = null;
    }
    else {
      console.log(this.getDisplayValue(event.detail.value as unknown as KeySetImpl<number>)[0]);
      this.selectedId = this.getDisplayValue(event.detail.value as unknown as KeySetImpl<number>)[0];
      this.getTaskData(this.getDisplayValue(event.detail.value as unknown as KeySetImpl<number>)[0]);
    }
  }
 
    

  // API
 
  private getUserData = () => {
    this.userService.getUserData().then( response => {
      console.log(response);
      response.data.items.forEach(user => {
        this.userData.push(user);
      });
    }).catch(error => {
      console.log(error);
    });
    
  }
  private getTaskData = (id) => {
    this.userService.getTaskData(id).then( response => {
      console.log(response);
      console.log(response.data.items[0]);
      this.newName(response.data.items[0].name);
      this.newStatus(response.data.items[0].done);
    }).catch(error => {
      console.log(error);
    });
  }
  private putTask = (name) => {
    this.userService.putTask(name);
  }
  // Buttons
  public deleteUser = ( ) => {
    console.log("VAmos a borrar");
    this.userService.deleteTask(this.selectedId);

  }
  public saveUser = ( ) => {
    if(this.selectedId === null) {
      try {
        this.userService.putTask(this.newName());
      } catch(error) {
        console.error(error);
      }
      console.log("se hizo");
      this.userData.push({id: 0, name: this.newName(), done: 'N'});
      this.userData.valueHasMutated();
    }
    else if (this.selectedId !== null) {
      this.userService.modifyTask(this.selectedId,this.newName(),this.newStatus());
    }


  
    
    //this.userData.push({name: this.newName(), title: this.newTitle(), email: this.newEmail()});
    //this.userData.valueHasMutated();
  }
  public buttonAction = (event: ojButtonEventMap['ojAction']) => {
    this.changeStatus();
    if(this.allTaskCompleted){
      console.log("completas");
      this.userService.updateTasks('N');

    } else {
      console.log("incompletas");
      
      this.userService.updateTasks('Y');

    }
  }
  public checkboxClick = (event, data) => {
    if(event.target.type === undefined){
      console.log("outisde");
      console.log(data.data.id);
      this.userService.deleteTask(data.data.id);
      this.userData().forEach(task => {
        if(task === data.data){
          this.userData.remove(task);
        }
      });
      this.userData.valueHasMutated();
    }
    else if(event.target.type === 'checkbox'){
      console.log(event.target.type);
      var id = parseInt(data.data.id);
      var name = data.data.name;
      var currentStatus = data.data.done;
      if(currentStatus === 'N'){
       currentStatus = 'Y';
      } else if(currentStatus === 'Y') {
       currentStatus = 'N';
      }
      data.data.done = currentStatus;
      this.userData.valueHasMutated();
      this.userService.modifyTask(id,name,currentStatus);
    }
      
    
    

  }
  public addNewTask = (event,data) => {
    if(event.key === 'Enter') {
      try {
        this.userService.putTask(this.newTask());
      } catch(error) {
        console.error(error);
      }
      this.userData.push({id: 0, name: this.newTask(), done: 'N'});
      this.userData.valueHasMutated();
      this.newTask('');
    }
  }
  public modifyTaskText = (event,data,item) => {
    if(event.key === 'Enter') {
      let r = (document.getElementById(event.explicitOriginalTarget.id) as HTMLInputElement).value;
      var id = parseInt(data.data.id);
      var done = data.data.done;
      this.userService.modifyTask(id,r,done);
      this.userData().forEach(task => {
        if(task.id === data.data.id){
          this.userData.remove(task);
          task.name = r;
          this.userData.push(task);
        }
      });
    }
  }
  
  public changeStatus = (  ) => {
    var count = 0;
    this.userData().forEach( task => {
      if(task.done === 'Y') count++;
    })
    if(count === this.userData().length) {
      this.allTaskCompleted = true;
      this.userData().forEach( task => {
        task.done = 'N'; 
      
    })} 
    else { 
      this.allTaskCompleted = false;
      this.userData().forEach( task => {
        task.done = 'Y'; 
    })}
    this.userData.valueHasMutated();
    
  }

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("Users page loaded.");
    document.title = "Users";
    
    // implement further logic if needed
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
    
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = DashboardViewModel;

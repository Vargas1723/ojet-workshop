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

import UserService from '../service/user.service';
import { KeySetImpl } from "ojs/ojkeyset";





interface UserData {
  id: number;
  name: String;
  done: String;
}

class UsersViewModel {
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
  }
  getDisplayValue(set: KeySetImpl<number>) {
    return (Array.from(set.values()));
  }

  public handleSelectionChange = (event: ojListView.selectionChanged<UserData['id'], UserData>) => {
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
  public changeStatus = ( ) => {
    if(this.selectedId !== null){
      if(this.newStatus() === 'N'){
        this.newStatus('Y');
      } else if(this.newStatus() === 'Y') {
        this.newStatus('N');
      }

    }
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


export = UsersViewModel;

import axios from 'axios';
import { AxiosPromise } from 'axios';

class UserService {
    private readonly API_URL = 'https://gd6c1a14fa23298-db202108261312.adb.us-ashburn-1.oraclecloudapps.com/ords/admin/api/task';

    constructor() {}

    public getUserData(): AxiosPromise {
        return axios.get(this.API_URL);
    }
    public getTaskData(id : number): AxiosPromise {
        return axios.get(this.API_URL + "/" + id)
    }
    public putTask(task: string) {
        axios.post(this.API_URL, {
            name: task
        }).then( response => {
                console.log(response);
            }).catch(error => {
            console.log(error)
        });
    }
    public deleteTask(id: number): AxiosPromise {
        return axios.delete(this.API_URL+"/"+id);
    }
    public modifyTask(id: number, name: string, done: string) {
        axios.put(this.API_URL + "/" + id, {
            name: name,
            done: done
        })
    }
    public updateTasks(done: string) {
        axios.put(this.API_URL, {
                done: done
        })
    }
}

export default UserService;
import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User} from '../../models/user';
import { UserService} from '../../services/user.service'



@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  providers: [UserService]
})
export class loginComponent implements OnInit{
    public title: string;
    public user: User;
    public status:string;
    public identity;
    public token;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ){
      this.title = 'Identificate';
      this.user = new User(  "","","","","","", "ROLE_USER","");

    }

    ngOnInit(){
      console.log('Componente cargado....');
    }

    onSubmit(){
    //Iniciar sesion del usuario y obtener los datos.
      this._userService.signup(this.user).subscribe(
      response => {
        this.identity = response.user;
        console.log(this.identity);


        if(!this.identity || !this.identity._id){
          this.status = 'error';
        }else{
          this.status = 'success';

          localStorage.setItem('identity',JSON.stringify(this.identity));

          this.getToken();
        }

        this.status = 'success'

      },
      error => {
        var errorMessage = <any>error;
        if(errorMessage =! null){
          this.status = 'error'
        }
      }
    );
  }

  getToken() {
    this._userService.signup(this.user, 'true').subscribe(
    response => {
      this.token = response.token;
      console.log(this.token);

      if(this.token <= 0){
        this.status = 'error';
      }else{
        this.status = 'success';

        localStorage.setItem('token',this.token);
      }

      console.log(response.user);
      this.status = 'success'

    },
    error => {
      var errorMessage = <any>error;
      if(errorMessage =! null){
        this.status = 'error'
      }
    }
  );
  }
}

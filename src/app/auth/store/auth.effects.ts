import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import * as AuthActions from './auth.actions';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

/**
 * Response of firebase
 * idToken:	     A Firebase Auth ID token for the newly created user or authenticated user.
 * email:	       The email for the newly created user or authenticated user.
 * refreshToken: A Firebase Auth refresh token for the newly created user or authenticated user.
 * expiresIn:    The number of seconds in which the ID token expires.
 * localId:      The uid of the newly created user or authenticated user.
 * registered:	 Whether the email is for an existing account.
 */
export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
  const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
  //store in browser the user info
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  //returning the action
  return new AuthActions.AuthenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate,
    redirect: true
  });
};

const handleError = (errorRes: any) => {
  let errorMessage = 'An unknown error occurred!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'This email does not exist.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'This password is not correct.';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.FIREBASE_PROJECT_KEY,
        {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true
        }
      )
      .pipe(
        tap( resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map((resData: AuthResponseData) => {
          return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),
        catchError(errorRes => {
          return handleError(errorRes);
        })
      );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.FIREBASE_PROJECT_KEY,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      )
      .pipe(
        tap( resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map((resData: AuthResponseData) => {
          return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),
        catchError(errorRes => {
          return handleError(errorRes);
        })
      );
    })
  );

  @Effect({ dispatch: false })
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if(authSuccessAction.payload.redirect){
        this.router.navigate(['/']);
      }
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string,
        id: string,
        _token: string,
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));
      if(!userData) {
        return {type: 'DUMMY'}
      } else {
        const loadedUser = new User(userData.email, userData.id, userData._token,
          new Date(userData._tokenExpirationDate));
        if(loadedUser.token){
          const expirationDuration =
            new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration); //setting the timer
          //return the action
          return new AuthActions.AuthenticateSuccess({email: loadedUser.email, userId: loadedUser.id,
            token: loadedUser.token, expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          });
        }
        return {type: 'DUMMY'}
      }
    })
  );

  @Effect({ dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer(); //clear timer
      //delete from local storage of browser the user info
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    })
  );

}

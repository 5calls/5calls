import firebase from 'firebase/app';
import 'firebase/auth';

export class Authentication {
  constructor() {
    if (!firebase.auth().currentUser) {
      // firebase
      //   .auth()
      //   .signInAnonymously()
      //   .then(() => {
      //     console.log("signed in anon");
      //   })
      //   .catch((error) => {
      //     console.log("error signing in", error);
      //   });
    } else {
      console.log('user already signed in');
    }
  }

  signout() {
    firebase.auth().signOut();
  }
}

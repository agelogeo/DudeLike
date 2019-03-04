import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController, ModalController,
  NavController,
  NavParams,
  PopoverController,
  ToastController
} from 'ionic-angular';
import {MyService} from "../../services/auth";
import {GooglePlus} from "@ionic-native/google-plus";
import {HomePage} from "../home/home";
import {PrivacyPage} from "../privacy/privacy";
import {HttpClient} from "@angular/common/http";
import {
  AdMobFree,
  AdMobFreeBannerConfig,
  AdMobFreeInterstitialConfig,
  AdMobFreeRewardVideoConfig
} from "@ionic-native/admob-free";
import {Clipboard} from "@ionic-native/clipboard";
import {Http} from "@angular/http";
import firebase from 'firebase';
import {Storage} from "@ionic/storage";
import {PopoverPage} from "../../components/popover/popover";
import {TermsPage} from "../terms/terms";
import { AppRate } from '@ionic-native/app-rate';
import {SocialComponent} from "../../components/social/social";
import {SocialSharing} from "@ionic-native/social-sharing";
import {VideoPage} from "../video/video";


/**
 * Generated class for the MainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  /*user:{
    email :string,
    name:string,
    pic:string
  }*/
  //host:string = "http://agelogeo.com/apps/maxcheaters.php?";
  link:string = "";
  loading : any;
  isBalanceOkay: boolean = true;
  emptyAd: boolean = true;
  wrongLink: boolean = false;
  MaxReached:boolean = false;
  minumum_balance:number = 0.1;

  // REWARDS
  // M id : ca-app-pub-4781041300358039/1843911351
  //rewardId:string = 'ca-app-pub-4781041300358039/1843911351';
  // T id : ca-app-pub-3940256099942544/5224354917
  rewardId:string = 'ca-app-pub-3940256099942544/5224354917';

  // INTERSTITIALS
  // M id : ca-app-pub-4781041300358039/7678815679
  //interId:string = 'ca-app-pub-4781041300358039/7678815679';
  // T id : ca-app-pub-3940256099942544/8691691433
  interId:string = 'ca-app-pub-3940256099942544/5224354917';

  // BANNERS
  // M id : ca-app-pub-4781041300358039/8162085306
  //bannerId:string = 'ca-app-pub-4781041300358039/8162085306';
  // T id : ca-app-pub-3940256099942544/6300978111
  bannerId:string = 'ca-app-pub-3940256099942544/6300978111';
  testing:boolean = false;
  isAdReady:boolean = false;

  mail :string;
  name:string;
  pic:string;

  constructor(public httpClient: HttpClient,
              public admobFree: AdMobFree,
              private loadingCtrl: LoadingController,
              private toastCtrl : ToastController,
              private clipboard: Clipboard,
              public googlePlus: GooglePlus,
              public myService:MyService,
              public navCtrl: NavController,
              private alertCtrl:AlertController,
              private storage: Storage,
              public popoverCtrl: PopoverController,
              public modalCtrl: ModalController,
              private appRate: AppRate,
              private socialSharing: SocialSharing) {

    this.showBannerAd();

    const review = Math.floor(Math.random() * 100) + 1;
    if(review<50){
      storage.get('review').then((val) => {
        if(val==null){
          this.presentReview();
        }
      }).catch( e => alert(e));

    }

    this.appRate.preferences.storeAppURL = {
      ios: '<app_id>',
      android: 'market://details?id=com.agelogeo.dudelike',
      windows: 'ms-windows-store://review/?ProductId=<store_id>'
    };



    this.mail =this.myService.json.email;
    this.name =this.myService.json["displayName"];
    this.pic = this.myService.json["imageUrl"];

    //this.checkBalanceAndLimit();


    const interConfig: AdMobFreeInterstitialConfig = {
      // add your config here
      // for the sake of this example we will just use the test config
      id: this.interId,
      autoShow: false,
      isTesting :this.testing
    };
    this.admobFree.interstitial.config(interConfig);

    this.admobFree.on(this.admobFree.events.INTERSTITIAL_CLOSE).subscribe( () => {
      this.admobFree.interstitial.prepare();
    });



    const videoConfig: AdMobFreeRewardVideoConfig = {
      // add your config here
      // for the sake of this example we will just use the test config
      id: this.rewardId,
      autoShow: false,
      isTesting :this.testing
    };
    this.admobFree.rewardVideo.config(videoConfig);

    this.admobFree.on(this.admobFree.events.REWARD_VIDEO_REWARD).subscribe(() => {
      this.admobFree.interstitial.isReady().then( () => this.admobFree.interstitial.show());
      const toast = this.toastCtrl.create({
        message: 'Congratulations. You will receive your reward soon.',
        showCloseButton: true,
        closeButtonText: 'Ok',
        position : 'top'
      });
      toast.present();
      this.getLikes();
      this.presentWarning();
    });

    this.admobFree.on(this.admobFree.events.REWARD_VIDEO_CLOSE).subscribe(() => {
      this.loading.dismiss();
      this.prepareAd().catch();
    });

    this.admobFree.on(this.admobFree.events.REWARD_VIDEO_LOAD).subscribe(() => {
      const toast = this.toastCtrl.create({
        message: 'Video loaded.',
        position: 'bottom',
        duration: 1000
      });
      toast.present();
      this.loading.dismiss();
      this.emptyAd = false;
    });

    this.admobFree.on(this.admobFree.events.REWARD_VIDEO_LOAD_FAIL).subscribe(() => {
      const toast = this.toastCtrl.create({
        message: 'Please try again later.',
        showCloseButton: true,
        closeButtonText: 'Ok',
        duration: 2000
      });
      toast.present();
      this.loading.dismiss();
      this.emptyAd = true;
    });


  }

  ionViewWillEnter() {
    this.checkBalanceAndLimit();
    //this.counter=this.getFirebaseCounter(this.myService.getActiveUser().uid,this.myService);
    console.log('ionViewDidLoad MainPage');
  }

  onLogOut(){
    this.googlePlus.logout();
    firebase.auth().signOut();
    this.storage.remove('json');
    this.navCtrl.setRoot(HomePage);
  }

  onPrivacy(){
    this.navCtrl.push(PrivacyPage);
  }

  presentWarning() {
    let alert = this.alertCtrl.create({
      title: 'Instant delivery',
      subTitle: 'You may need to wait some minutes for your likes to be delivered.',
      message : `Usually it takes 1 to 5 minutes but please allow us 24 hours to deliver your likes on heavy traffic.`,
      buttons: ['I understand.']
    });
    alert.present();
  }

  presentReview() {
    let alert = this.alertCtrl.create({
      title: '⭐ App Rating ⭐',
      subTitle: 'Please take a break and review our application.',
      message : `If you enjoyed our services please rate our app with 5 stars.<br>⭐⭐⭐⭐⭐`,
      buttons: [
        {
          text: 'Not now',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Take me there!',
          handler: () => {
            this.appRate.navigateToAppStore();
            this.storage.set('review', true);
          }
        }
      ]
    });
    alert.present();
  }



  presentSocial(myEvent : MouseEvent){
    //alert(this.myService.host);
    //
    // alert(this.myService.maxLimit);
    const popover = this.popoverCtrl.create(SocialComponent);
    popover.present({ev: myEvent});
    popover.onDidDismiss(
      data => {
        if (data == null) {

        }else{
          if (data.action == "android"){
            this.socialSharing.share('Dudelike helps you promote your social profile on your favorite social network. It provides you the easiest way to get unlimited free likes on the photo of your preference.','Free Likes - Dudelike','assets/imgs/logo.png','https://play.google.com/store/apps/details?id=com.agelogeo.dudelike').then(() => {
              // Success!
            }).catch(() => {
              // Error!
            });
          } else if (data.action == "ios"){
            this.socialSharing.share('Dudelike helps you promote your social profile on your favorite social network. It provides you the easiest way to get unlimited free likes on the photo of your preference.','Free Likes - Dudelike','assets/imgs/logo.png','https://play.google.com/store/apps/details?id=com.agelogeo.dudelike').then(() => {
              // Success!
            }).catch(() => {
              // Error!
            });
          }
        }
      }
    )
  }

  presentPopover(myEvent : MouseEvent) {
    const popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ev: myEvent});
    popover.onDidDismiss(
      data => {
        if (data == null) {

        }else{
          if (data.action == "privacy"){
            this.navCtrl.push(PrivacyPage);
           /* let profileModal = this.modalCtrl.create(PrivacyPage);
            profileModal.present();*/
          } else if (data.action == "terms"){
            this.navCtrl.push(TermsPage);
           /* let profileModal = this.modalCtrl.create(TermsPage);
            profileModal.present();*/
          }else if (data.action == "feedback"){
            this.showFeedbackPrompt();
          } else if (data.action == "rate"){
            this.appRate.navigateToAppStore();
          }
        }
      }
    )
  }

  onInstructions(){
    this.navCtrl.push(VideoPage).catch(e => alert(e));
  }

  onPaste(){
    this.clipboard.paste().then(
      (resolve: string) => {
        this.link = resolve;

        if(!this.isLinkInvalid())
          this.prepareAd();

      },
      (reject: string) => {
        const toast = this.toastCtrl.create({
          message: 'Copy a URL first',
          showCloseButton: true,
          closeButtonText: 'Ok',
          duration: 3000
        });
        toast.present();
      }
    ).catch();
  }

  showAd(){
    this.admobFree.rewardVideo.show().catch();
    this.admobFree.interstitial.prepare();
  }

  async prepareAd() {
    //try {
    this.loading = this.loadingCtrl.create({
      content: 'Loading ads...'
    });

    this.loading.present();

    if(this.isBalanceOkay){

      this.admobFree.rewardVideo.prepare()
        .then(() => {
          // banner Ad is ready


          //if(this.admobFree.rewardVideo.isReady())
        })
        .catch(e => {
        });
    }

    setTimeout(() => {
      this.loading.dismiss();

    }, 3000);
  }

  isValid(){
    if(this.link.startsWith('https://www.') && this.link.length>30 && this.link.slice(21,28).match('.com/p/') && this.isBalanceOkay && !this.emptyAd && !this.isMaxReached()){
      return true;
    }
    return false;
  }

  isLinkInvalid(){
    if(this.link.startsWith('https://www.') && this.link.length>35 && this.link.slice(21,28).match('.com/p/')){
      this.wrongLink = false;
      return false;
    }else if(this.link.length>20){
      this.wrongLink = true;
      return true;
    }
  }

  getLikes(){

    this.httpClient.get(this.myService.host+'likes=true&balance=true&limit=true&email='+this.myService.json.email+'&link='+this.link)
      .subscribe(data => {
        this.MaxReached = data['limitReached'];
        if(this.minumum_balance < data['balance']){
          this.isBalanceOkay=true;
        }else{
          this.isBalanceOkay=false;
        }
        console.log('Balance: ', data['balance']);
        console.log('limitReached: ', data['limitReached']);
      });


  }



  showFeedbackPrompt() {
    const prompt = this.alertCtrl.create({
      title: 'Leave us a feedback',
      message: "Please let us know, if you encounter any issues or suggest us some ideas.",
      inputs: [
        {
          name: 'message',
          placeholder: 'Your message'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            //alert(data.message);
            this.sendFeedBack(data.message);
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }

  sendFeedBack(message : string){
    if(message.length > 1){
      this.httpClient.get(this.myService.host+'contact=true&text='+message+'&email='+this.myService.json.email)
        .subscribe(data => {
          const toast = this.toastCtrl.create({
            message: 'Thank you for contacting us.',
            position : 'middle',
            duration: 3000
          });
          toast.present();
        });
    }
  }



  isMaxReached(){
    return this.MaxReached;
  }

  checkBalanceAndLimit(){

    this.httpClient.get(this.myService.host+'balance=true&limit=true&email='+this.myService.json.email)
      .subscribe(data => {
        //alert(data);
        this.MaxReached = data['limitReached'];

        if(this.minumum_balance < data['balance']){
          this.isBalanceOkay=true;
        }else{
          this.isBalanceOkay=false;
        }
        console.log('Balance: ', data['balance']);
        console.log('limitReached: ', data['limitReached']);

      });

  }

  showBannerAd(){
    const bannerConfig: AdMobFreeBannerConfig = {
      // add your config here
      // for the sake of this example we will just use the test config
      id: this.bannerId,
      autoShow: true,
      isTesting : this.testing
    };
    this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare().then(() => {
      this.admobFree.banner.show();
    })
  }
}

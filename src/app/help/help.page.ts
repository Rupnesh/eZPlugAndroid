import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { Platform} from '@ionic/angular';
import { DashBoardService } from '../dashboard/dashboard.service';
import { NetworkService } from '../../app/services/network.service'
import { AlertService } from '../services/alert.service';
import { constString } from '../constString';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./styles/help.page.scss'],
  animations: [ 

    trigger('container', [
      state('flyIn', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        // style({ transform: 'translateX(100%)', opacity: 0 }),
        // animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))

        style({ height: 0, opacity: 0 }),
            animate('1s ease-out', 
                    style({ height: 300, opacity: 1 }))

      ]),
      transition(':leave', [
        // style({ transform: 'translateX(0)', opacity: 1 }),
        // animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
        style({ height: 300, opacity: 1 }),
            animate('0.2s ease-in', 
                    style({ height: 0, opacity: 0 }))
      ])
    ])

  ]
})
export class HelpPage implements OnInit, AfterViewInit {

  questionsList: any;
  answersList: any;
  previousIndex = 0;
  nextIndex;
  networkStatus: any;

  constructor(private emailComposer: EmailComposer, private platform: Platform, 
    private dashboardService: DashBoardService, public networkService: NetworkService, public alertService: AlertService) {

  } 
  async ionViewDidEnter() {
    // this.platform.backButton.subscribeWithPriority(9999, () => {
    //   document.addEventListener('backbutton', function (event) {
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }, false);
    // });
  }
  async ngOnInit() {
    this.networkStatus = await this.networkService.getNetworkStatus()
    if (this.networkStatus.connected) {
      this.dashboardService.getFAQS().subscribe(data => {
        this.questionsList = data
      })
    }
    else {
      this.questionsList = [
        {
          question: "How to login in to application?",
          answer: "Login process is easy, whenever user wants, user needs to enter the mobile number, after that user will get OTP on the entered number.",
        },
        {
          question: "How to use app?",
          answer: "After installing app, we are asking for few permissions like location, sms and call. To use this app, user needs to grant location access to easily access app services. User can search the nearby stations through searchbar and search option available on dashboard page",
        },
        {
          question: "Why I am getting authentication issue?",
          answer: "If multiple user are accessing the app on different devices with same mobile number than one of them will be get authentication issue.",
        },
        {
          question: "Why app asking for login after few days?",
          answer: "To provide the secure access to user, we are keeping the user session for 14 days, so after 14 days user needs to login again.",
        },
        {
          question: "How to search nearby charging stations?",
          answer: "To search nearby charging stations, user need to grant location access, from users current location we are providing the list of stations within 10km radius.",
        },
        {
          question: "How to charge my vehicle?",
          answer: "On station details page, we are asking for few parameters like price, time, unit, unlock box, plug cable, lock door. After this process user can start the charging process.",
        },
        { 
          question: "Is my vehicle and charger are secured, when I am not present at the location?",
          answer: "Yes, we are providing the secure system through door lock/unlock facility. If user dont want to stay at the location while charging, user can access our system from anywhere.",
        },
        {
          question: "How to make payment?",
          answer: "After charging stop, user will prompt with bill which includes services charges + tax, user can make payment through debit, credit or UPI."
        },
      ]
    }

    

    
  }
  ngAfterViewInit(): void {

    // this.animationCtrl.create()
    //   .addElement(document.querySelector('.flyin'))
    //   .duration(1500)
    //   .iterations(Infinity)
    //   .fromTo('transform', 'translateX(0px)', 'translateX(100px)')
    //   .fromTo('opacity', '1', '0.2');
  }

  toggleGroup(item, index) {

    if (this.nextIndex == null) {
      this.nextIndex = index
    }
    else {
      this.previousIndex = this.nextIndex
      this.nextIndex = index;
    }
    if (this.previousIndex == this.nextIndex)
      index == 0 ? item.show = !item.show : item.show = !item.show
    else
      this.questionsList.map((data, i) => { index === i ? data.show = true : data.show = false })
  }
  composeMail() {
    let email = {
      to: 'ezplug@ztric.com',
      attachments: [
      ],
      subject: 'Enter your query tagline',
      body: 'What kind of problem you are facing?',
      isHtml: true
    }

    this.emailComposer.isAvailable().then((available: boolean) => {
      if(available) {
        this.emailComposer.open(email);
      }
      else {
        this.alertService.presentToast(constString.SOMETHING_WRONG)
      }
    }, (err) => {
      this.alertService.presentToast(constString.SOMETHING_WRONG)
    });
  }
  // isGroupShown(question) {
  //   return question.show;
  // }

}

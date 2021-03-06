import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/modals/order.model';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { EmailService } from 'src/app/services/email.service';
import { OrdersService } from 'src/app/services/order.service';
import { Customer } from 'src/app/modals/customer.model';
import { QRCodeModule, QRCodeComponent } from 'angularx-qrcode';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { map, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface ArrayOrder {
  orders: Order;
  priceNumber: number;
  price: string;
  qrcode: string;
}

export interface ArrayOrderTotal {
  label: string;
  arrOrders: Array<ArrayOrder>;
  isConfirm: Array<boolean>;
}

export interface DialogData {
  content: string;
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})

export class OrderListComponent implements OnInit, OnDestroy {

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('qrcode') qrcode: QRCodeComponent;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();


  private orderListenerSubs: Subscription;

  qrcodeContent = '';

  userIsAuthenticated = false;
  emailCustomer: string;
  ArrOrders: Array<ArrayOrder> = [];

  ArrayOrderTotal: Array<ArrayOrderTotal> = [];
  labels = ['????n m???i', '????n ???? x??c nh???n',  '????n ???? h???y'];
  displayedColumns: string[] = ['date', 'nameTicket', 'service', 'quantity', 'price', 'qrcode',  'delete', 'confirm'];
  listTabValue = [];
  cost = [];

  content: string;
  from: string;
  isConfirm = [];
  dataSource = [];

  constructor(
    private storage: AngularFireStorage,
    @Inject(DOCUMENT) private _document: Document,
    public dialog: MatDialog,
    private authService: AuthService,
    public customerService: CustomerService,
    public orderService: OrdersService,
    private router: Router,
    public route: ActivatedRoute,
    public emailService: EmailService
  ) { }

  // ngAfterViewInit() {
  //   for (let i = 0; i< this.dataSource.length; i++) {
  //     // this.ArrayOrderTotal[i].arrOrders.paginator = this.paginator.toArray()[i];
  //     this.dataSource[i].sort = this.sort.toArray()[i];
  //   }
  //   // console.log('ngAfter: ', this.dataSource);
  // }

  ngOnInit(): void {
    this.authService.autoAuthUser();
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.orderService.getOrderOfCreator();
    this.orderListenerSubs = this.orderService.getOrderUpdateListener()
      .subscribe((order: Order[]) => {
        // cal price total
        for (let i = 0; i < order.length ; i++) {
          let sum = 0;
          for (let j = 0; j < order[i].itemService.length; j++) {
            // tslint:disable-next-line:radix
            sum += parseInt(order[i].itemService[j].itemServicePrice) * order[i].itemService[j].quantity;
          }
          this.ArrOrders[i] = {
            orders: order[i],
            priceNumber: sum,
            price: sum.toLocaleString('en-us', {minimumFractionDigits: 0}),
            qrcode: order[i].id + ' - ' + order[i].payMethod
          };
        }

        this.listTabValue.push(this.ArrOrders.filter(
          element => !element.orders.status && !element.orders.isCancel && !element.orders.isConfirm)); // m???i
        this.listTabValue.push(this.ArrOrders.filter(
          element => element.orders.isConfirm && !element.orders.isCancel)); // ????n ch??a d??ng
        // this.listTabValue.push(this.ArrOrders.filter(
        //   element => element.orders.status && element.orders.isConfirm)); // ????n ???? d??ng
        this.listTabValue.push(this.ArrOrders.filter(
          element => element.orders.isCancel)); // ????n ???? h???y

        for (let i = 0; i < 3; i++) {
          // this.dataSource[i] = new MatTableDataSource(this.listTabValue[i]);
          // console.log('tab: ', this.listTabValue[i]);
          this.ArrayOrderTotal[i] = {
            label: this.labels[i],
            arrOrders: this.listTabValue[i],
            isConfirm: Array(this.listTabValue[i].length).fill(false)
          };
        }
        // t???ng cost m???i tab
        for (let i = 0; i < 4 ; i++) {
          let sum = 0;
          for (let j = 0; j < this.ArrayOrderTotal[i].arrOrders.length; j++) {
            sum += this.ArrayOrderTotal[i].arrOrders[j].priceNumber;
          }
          this.cost.push(sum.toLocaleString('en-us', {minimumFractionDigits: 0}));
        }

        console.log(this.ArrayOrderTotal);
      });
  }

  _setDataSource(indexNumber) {
    setTimeout(() => {
      switch (indexNumber) {
        case 0:
          this.dataSource[0].paginator = this.paginator.toArray()[0];
          this.dataSource[0].sort = this.sort.toArray()[0];
          break;
        case 1:
          this.dataSource[1].paginator = this.paginator.toArray()[1];
          this.dataSource[1].sort = this.sort.toArray()[1];
        case 2:
          this.dataSource[2].paginator = this.paginator.toArray()[2];
          this.dataSource[2].sort = this.sort.toArray()[2];
      }
    },500);
  }


  handleDismiss(dismissMethod: string) {

  }

  CancelOrderManager(idOrder: string, idCustomer: string) {

    const username = new Promise((resolve, reject) => {
      this.customerService.getInfoCustomerFromManager(idCustomer).subscribe(
        infoCustomer => resolve(infoCustomer.username),
        err => reject(err)
    ); });


    const email = new Promise((resolve, reject) => {
      this.customerService.getInfoCustomerFromManager(idCustomer).subscribe(
        infoCustomer => resolve(infoCustomer.email),
        err => reject(err)
    ); });


    Promise.all([username, email]).then(
      async values => {
        console.log('test');
        const { value: text } = await Swal.fire({
          input: 'textarea',
          inputLabel: 'G???i l?? do t???i cho kh??ch h??nh c???a b???n!',
          inputPlaceholder: 'Nh???p l?? do...',
          inputAttributes: {
            'aria-label': 'Nh???p ??? ????y'
          },
          showCancelButton: true
        });

        if (text) {
          this.orderService.updateIsSuccessOrder(idOrder, false, true);
          const textEmail = `
          <div>
            <h3>Xin ch??o ` + values[0] + `,</h3>
            <p>C???m ??n b???n ???? ?????t v?? tr??n trang web <span style="font-weight: bold;">TripCheap.</span>
              Ch??ng t??i r???t ti???c ph???i th??ng b??o v???i b???n ????n h??ng ???? b??? h???y v?? l?? do t??? ?????i l?? nh?? sau:
            </p>
            <div style="padding: 5px; border: 1px solid #f2f2f2; border-radius: 10px;">
              <p style="font-style: italic;">` + text + `</p>
            </div>
            <p>Sorry,</p>
            <p style="font-weight: bold;">TripCheap,</p>
            <p><span style="font-weight: bold;">Email: </span>tripcheap@gmail.com</p>
            <p><span style="font-weight: bold;">S??? ??i???n tho???i: </span>039 994 5504</p>
          </div>`;
          // console.log('test1');
          this.emailService.sendEmail(
            values[1].toString(),
            'tripcheap.pay@gmail.com',
            'Th??ng b??o h???y ????n h??ng - TripCheap',
            'this is email from TripCheap team.',
            textEmail
          ).then(res => {
            Swal.fire({
              title: '???? g???i mail h???y ????n h??ng th??nh c??ng!',
              icon: 'success'}).then(() => {
                this._document.defaultView.location.reload();
              });
          });
        }
    }).catch(err => {console.log(err); });

  }

  dataURLtoFile(dataurl, filename) {
    console.log('dataurl ', dataurl);
    // tslint:disable-next-line:prefer-const
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        // tslint:disable-next-line:prefer-const
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
  }


  ConfirmOrderManager(idOrder: any, idCustomer: any, indexTab: any, i: any) {
    // console.log(i+1);
    const username = new Promise((resolve, reject) => {
      this.customerService.getInfoCustomerFromManager(idCustomer).subscribe(
        infoCustomer => resolve(infoCustomer.username),
        err => reject(err)
    ); });

    const email = new Promise((resolve, reject) => {
      this.customerService.getInfoCustomerFromManager(idCustomer).subscribe(
        infoCustomer => resolve(infoCustomer.email),
        err => reject(err)
    ); });

    const qrcode = new Promise((resolve, reject) => {
      // init file name to upload firebase storage
      const n = Date.now();
      const filePath = `qrcode/${n}`;
      const fileRef = this.storage.ref(filePath);

      // tslint:disable-next-line:no-shadowed-variable
      const x = new Promise((resolve) => {
        resolve(this.qrcode.qrcElement.nativeElement.innerHTML);
      }).then((value) => {
          const valueString = value as string;
          // str = valueString.substr(10, valueString.length - 12);
          // tslint:disable-next-line:max-line-length
          const task = this.storage.upload(`qrcode/${n}`, this.dataURLtoFile(valueString.substr(10, valueString.length - 12), 'qrcode-' + idOrder.toString() + '.png'));
          task.snapshotChanges().pipe(
          finalize(() => fileRef.getDownloadURL().subscribe(
            res => resolve(res),
            err => reject(err)
          ))).subscribe();
      });
    });

    let textItemService = '';
    for (const item of this.ArrayOrderTotal[indexTab].arrOrders[i].orders.itemService) {
      textItemService +=
        `<tr>
          <td style="width: fit-content;">` + item.itemServiceName + `: </td>
          <td>` + item.quantity + `</td>
        </tr>`;
    }

    Promise.all([username, email, qrcode]).then( values => {
      this.orderService.updateIsSuccessOrder(idOrder, true, false);
      const textEmail = `
        <div>
          <h3>Xin ch??o ` + values[0] + `,</h3>
          <p>C???m ??n b???n ???? ?????t v?? tr??n trang web <span style="font-weight: bold;">TripCheap.</span>
            ????n h??ng c???a b???n ???? ???????c ?????i l?? x??c nh???n ????n.
            M?? QR code c???a b???n ch??? c?? hi???u l???c trong kho???ng th???i gian t???
            <span style="font-weight: bold;">` + this.ArrayOrderTotal[indexTab].arrOrders[i].orders.dateStart  + `</span> t???i
            <span style="font-weight: bold;">` + this.ArrayOrderTotal[indexTab].arrOrders[i].orders.dateEnd  + `</span>.
          </p>
          <p style="font-style: italic;">
            <span style="font-weight: bold;">L??u ??:</span> Ch??? ???????c h???y ????n h??ng tr?????c ng??y h???t h???n l?? m???t ng??y.
          </p>
          <div>
            <tbody style="width:100%">
              <tr>
                <td style="width: fit-content;">T??n v??: </td>
                <td>` + this.ArrayOrderTotal[indexTab].arrOrders[i].orders.nameTicket + `</td>
              </tr>
              <tr>
                <td style="width: fit-content;">D???ch v???: </td>
                <td>` + this.ArrayOrderTotal[indexTab].arrOrders[i].orders.itemService[0].name + `</td>
              </tr>
              ` + textItemService + `
              <tr>
                <td style="width: fit-content;">T???ng c???ng:</td>
                <td style="font-weight: bold;">` +
                  this.ArrayOrderTotal[indexTab].arrOrders[i].priceNumber.toLocaleString('en-us', {minimumFractionDigits: 0}) + `??</td>
              </tr>
            </tbody>
          <div>
          <div>
            <p>S??? d???ng m?? QR ????? v??o c???ng:</p>
            <div style="box-shadow: 0 0 20px #e2e1e1;border-radius: 20px;">
              <img style="text-align: center;" src="` + values[2] + `">
            </div>
          </div>
          <p>Thank you,</p>
          <p style="font-weight: bold;">TripCheap,</p>
          <p><span style="font-weight: bold;">Email: </span>tripcheap@gmail.com</p>
          <p><span style="font-weight: bold;">S??? ??i???n tho???i: </span>039 994 5504</p>
        </div>`;
      Swal.fire({
        title: 'B???n c?? mu???n x??c nh???n ????n h??ng!',
        showDenyButton: true,
        confirmButtonText: `X??c Nh???n`,
        denyButtonText: `H???y`,
        icon: 'info'
      }).then((result) => {
        if (result.isConfirmed) {
          this.emailService.sendEmail(
            values[1].toString(),
            'tripcheap.pay@gmail.com',
            this.ArrayOrderTotal[indexTab].arrOrders[i].orders.nameTicket + '- ????n h??ng ???? ???????c x??c nh???n!',
            'This is email from TripCheap.',
            textEmail
          ).then(res => {
            Swal.fire({
              title: '???? g???i mail x??c nh???n ????n t???i kh??ch h??ng th??nh c??ng!',
              icon: 'success'}).then(() => {
                this._document.defaultView.location.reload();
              });
          });
        } else if (result.isDenied) {}
      });

    });
  }

  ngOnDestroy(): void {
    this.orderListenerSubs.unsubscribe();
  }
}


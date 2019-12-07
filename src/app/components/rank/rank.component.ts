
import { Component, OnInit } from '@angular/core';
import { Router,  } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2'
import { from } from 'rxjs';
import { RankApiService } from './../../services/rank-api.services'
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss']
})
export class RankComponent implements OnInit {
  constructor(
    public router: Router,
    private modalService: NgbModal,
    private toast: ToastrService,
    private rankApi: RankApiService,
  ) {
    this.page = 1;
    this.pageSize = 25;
  }
  public loading = false;
  iconIsActive: boolean;
  page: number;
  pageSize: number;
  selectedAll: any;
  inputRank;

  updateRank = {};
  updateStatus = [];

  listRank = [];
  searchText;
  check;

  ngOnInit() {
    this.restartData();
    this.getRank();
  }

  PageSize(test: number) {
    this.pageSize = test;
  }

  restartData(){
    this.inputRank = {
      name: '',
      isActive: true,
    };
  }

  clickButtonRefresh(refesh) {
    refesh.classList.add('spin-animation');
    setTimeout(function () {
      refesh.classList.remove('spin-animation');
    }, 500);
    this.getRank();
    this.selectedAll = false;
  }

  checkIfAllSelected() {
    this.updateStatus = [];
    this.selectedAll = this.listRank.every(function (item: any) {
      return item.selected == true;
    })
    for (var i = 0; i < this.listRank.length; i++) {
      if (this.listRank[i].selected == true) {
        this.updateStatus.push(this.listRank[i].rankId)
      }
    }
  }

  selectAll() {
    if (this.updateStatus.length != 0) {
      this.updateStatus = [];
      this.listRank.forEach(element => {
        element.selected = false
      });
      return;
    }
    for (var i = 0; i < this.listRank.length; i++) {
      this.listRank[i].selected = this.selectedAll;
      this.updateStatus.push(this.listRank[i].rankId)
    }
  }

  getRank() {
    this.loading = true;
    this.rankApi.getAllRank(true).subscribe(
      (data) => {
        this.loading = false;
        this.listRank = data['data']['data'];
        this.selectedAll = false;
      },
      (error) => {
        if (error.status == 0) {
          this.toast.error('Server is not availiable');
        }
        if (error.status == 404) {
          this.toast.error('Not found');
        }
        if (error.status == 500) {
          this.toast.error('Server error');
        }
        this.loading = false;
      }
    );
  }

  open(content){
    this.modalService.open(content, {backdrop: 'static',ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }).catch((error) => {
    });
  }

  openDetail(content, item){
    this.updateRank['rankId'] = item.rankId;
    this.updateRank['name'] = item.name;
    this.updateRank['isActive'] = item.isActive;
    this.modalService.open(content, {backdrop: 'static',ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }).catch((error) => {
    });
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  Save(){
    this.validate();
    if (this.check == false) {
      return;
    }
    else {
    Swal.fire({
      title: 'Are you sure?',
      text: 'The rank will be create!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, do not create '
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.rankApi.insertRank(this.inputRank).subscribe(data => {
          this.closeModal();
          this.restartData();
          this.toast.success(data['message']);
          this.getRank();
          this.loading = false;
        }, (error) => {
          if (error.status == 0) {
            this.toast.error('Server is not availiable');
          }
          if (error.status == 400) {
            this.toast.error('Company name is exist');
          }
          if (error.status == 500) {
            this.toast.error('Server error');
          }
          this.loading = false;
        });
      }
    });
  }
  }

  Update(){
    Swal.fire({
      title: 'Are you sure?',
      text: 'The rank will be update!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, do not update '
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.rankApi.updateRank(this.updateRank).subscribe(data => {
          this.closeModal();
          this.restartData();
          this.toast.success(data['message']);
          this.getRank();
          this.loading = false;
        }, (error) => {
          if (error.status == 0) {
            this.toast.error('Server is not availiable');
          }
          if (error.status == 500) {
            this.toast.error('Server error');
          }
          this.loading = false;
        });
      }
    });
  }

  clickButtonChangeStatus(status: boolean){
    if (status == false) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'The rank will be delete!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          this.loading = true;
          console.log(this.updateStatus)
          this.rankApi.changeStatus(this.updateStatus, status).subscribe(data => {
            this.getRank();
            this.closeModal();
            this.loading = false;
            this.toast.success(data['message'])
            this.selectedAll = false;
          }, (error) => {
            if (error.status == 0) {
              this.toast.error('Server is not availiable');
            }
            if (error.status == 500) {
              this.toast.error('Server error');
            }
            this.closeModal();
            this.loading = false;
          });
        }
      });
    }
    else {
      Swal.fire({
        title: 'Are you sure?',
        text: 'The company will be enable!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, enable it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          this.loading = true;
          this.rankApi.changeStatus(this.updateStatus, status).subscribe(data => {
            this.getRank();
            this.closeModal();
            this.loading = false;
            this.toast.success(data['message'])
            this.selectedAll = false;
          }, (error) => {
            if (error.status == 0) {
              this.toast.error('Server is not availiable');
            }
            if (error.status == 500) {
              this.toast.error('Server error');
            }
            this.closeModal();
            this.loading = false;
          });
        }
      });
    }
  }

  validate(){
    this.check = true;
    this.inputRank['name'] = $.trim(this.inputRank['name'].replace(/\s\s+/g, ' ')).toUpperCase();
    $("#rankName").css("border-color", "");
    if (this.inputRank['name'] == "" || this.inputRank['name'] == undefined) {
      this.toast.error('Please input rank name');
      $("#rankName").css("border-color", "red");
      this.check = false;
    }
    else if (this.inputRank['name'].length < 3) {
      this.toast.error('Please input rank name min 3 characters');
      $("#rankName").css("border-color", "red");
      this.check = false;
    }
  }

  validateRankName(){
    this.inputRank['name'] = $.trim(this.inputRank['name'].replace(/\s\s+/g, ' ')).toUpperCase();
    $("#rankName").css("border-color", "");
    if (this.inputRank['name'] == "" || this.inputRank['name'] == undefined) {
      this.toast.error('Please input rank name');
      $("#rankName").css("border-color", "red");
      return false;
    }
    else if (this.inputRank['name'].length < 3) {
      this.toast.error('Please input rank name min 3 characters');
      $("#rankName").css("border-color", "red");
      return false;
    }
  }


}

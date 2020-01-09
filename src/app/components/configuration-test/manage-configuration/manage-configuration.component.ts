import { EmployeeApiService } from 'src/app/services/employee-api.service';
import { RankApiService } from './../../../services/rank-api.services';
import { CatalogueApiService } from './../../../services/catalogue-api.service';
import { ConfigurationApiService } from './../../../services/configuration-api.service';
import { CompanyApiService } from '../../../services/company-api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import Stepper from 'bs-stepper';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'manage-configuration',
  templateUrl: './manage-configuration.component.html',
  styleUrls: ['./manage-configuration.component.scss']
})
export class ManageConfigurationComponent implements OnInit {
  public rateCataOfRank: number[] = []
  constructor(
    public router: Router,
    private modalService: NgbModal,
    private companyApi: CompanyApiService,
    private configAPi: ConfigurationApiService,
    private catalogueApi: CatalogueApiService,
    private rankApi: RankApiService,
    private toast: ToastrService,
    private employeeApi: EmployeeApiService,
  ) {

  }
  public loading = false;
  startDate: Date = new Date();

  endDate: Date = new Date();
  settings1 = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy hh:mm a',
    defaultOpen: false,
    closeOnSelect: false,
  };
  settings2 = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy hh:mm a',
    defaultOpen: false,
    closeOnSelect: true,
  };

  private stepper: Stepper;
  index = 1;
  indexDetail = 1;
  iconIsActive: boolean;

  selectedAll;
  selectConfiguration = [];
  Configurations = [];

  ListRank = [];
  inputConfiguration = {};

  searchText = '';

  updateConfig = {};

  selectedItems = [];
  selectedItemsUpdate = []
  dropdownSettings = {
    singleSelection: false,
    text: 'Select Rank',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: 'form-control form-group',
    labelKey: 'name',
    primaryKey: 'rankId',
    maxHeight: 240,
    showCheckbox: true,
    badgeShowLimit: 3,
  };
  dropdownSettingsDetail = {
    singleSelection: false,
    text: 'Select Catalogue',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: 'form-control form-group',
    labelKey: 'name',
    primaryKey: 'companyCatalogueId',
    maxHeight: 240,
    showCheckbox: true,
    badgeShowLimit: 0,
  };

  companyId = localStorage.getItem('CompanyId');
  avaragePercent = [];

  listCatalogue = [];

  ngOnInit() {
    this.getAllRank(true);
    this.getConfigurationIsActive(true);
    this.getAllCompanyCatalogue();
  }

  onDeSelectAll(item: any) {
    this.selectedItems = []
  }

  open(content) {
    this.index = 1;
    this.startDate = new Date();

    this.endDate = new Date();
    this.inputConfiguration['title'] = "";
    this.inputConfiguration['companyId'] = localStorage.getItem("CompanyId");
    this.inputConfiguration['title'] = '';
    this.inputConfiguration['type'] = true;
    this.inputConfiguration['duration'] = 15;
    this.inputConfiguration['startDate'] = this.startDate;
    this.inputConfiguration['endDate'] = this.endDate.setDate(this.startDate.getDate() + 1);
    this.selectedItems = [];
    this.modalService.open(content, { backdrop: 'static', size: 'lg', windowClass: 'myCustomModalClass' });
    const a = document.querySelector('#stepper1');
    this.stepper = new Stepper(a, {
      linear: false,
      animation: true
    });
  }

  openDetail(content, id: number) {
    this.indexDetail = 1;
    this.modalService.open(content, { size: 'lg', windowClass: 'myCustomModalClass' });
    const a = document.querySelector('#update');
    this.stepper = new Stepper(a, {
      linear: false,
      animation: true
    });
  }

  next() {
    if (this.validateConfiguration() === false) {
      return;
    }
    this.stepper.next();
    this.index = this.index + 1;
    this.inputConfiguration['startDate'] = this.startDate;
    this.inputConfiguration['endDate'] = this.endDate;
  }

  nextDetail() {
    this.stepper.next();
    this.indexDetail += 1;
  }

  back() {
    this.index = this.index - 1;
    this.stepper.previous();
  }

  backDetail() {
    this.indexDetail = this.indexDetail - 1;
    this.stepper.previous();
  }

  closeModal() {
    this.modalService.dismissAll();
    this.index = 1;
  }

  getAllCompanyCatalogue() {
    this.catalogueApi.getAllCatalogue(true, this.companyId).subscribe(
      (data) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].quescount == 0) {
            data.splice(i, 1);
            i--
          }
        }
        this.listCatalogue = data;
      },
      (error) => {
        this.loading = false;
        if (error.status == 0) {
          this.toast.error('Server is not availiable');
        }
        if (error.status == 404) {
          this.toast.error('Not found');
        }
        if (error.status == 500) {
          this.toast.error('Server error');
        }
      },
    );
  }

  getAllRank(status) {
    this.rankApi.getAllRank(status, this.companyId).subscribe(
      (data) => {
        this.ListRank = data;
      },
      (error) => {
        this.loading = false;
        if (error.status == 0) {
          this.toast.error('Server is not availiable');
        }
        if (error.status == 404) {
          this.toast.error('Not found');
        }
        if (error.status == 500) {
          this.toast.error('Server error');
        }
      }
    );
  }

  DeSelectRank(value) {
    for (let i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].rankId == value.rankId) {
        this.selectedItems.splice(i, 1);
        break;
      }
    }
  }

  clickButtonRefresh(refesh) {
    this.getConfigurationIsActive(true);
  }


  getConfigurationIsActive(status) {
    this.loading = true;
    this.iconIsActive = status;
    this.configAPi.getAllConfiguration(true, this.companyId).subscribe(
      (data) => {
        this.Configurations = data;
        this.Configurations.forEach(element => {
          element.selected = false;
        });
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.toast.error(error.name);
      }
    );
  }

  selectAll() {
    if (this.selectedAll) {
      this.Configurations.forEach(e => {
        e.selected = true;
        this.selectConfiguration.push(e.configId);
      });
    }
    else {
      this.Configurations.forEach(e => {
        e.selected = false;
      });
      this.selectConfiguration = [];
    }

  }

  checkIfAllSelected(configId) {
    var index = this.Configurations.findIndex(x => x.configId == configId);
    this.Configurations[index].selected = !this.Configurations[index].selected;
    if(this.Configurations[index].selected == false){
        this.selectConfiguration.splice( this.Configurations.indexOf(configId), 1 );
        this.selectedAll = false;
    }else{
        this.selectConfiguration.push(configId);
        if(this.selectConfiguration.length == this.Configurations.length){
            this.selectedAll = true;
        }
    }

  }

  Sample() {
    const sampleTest = {
      companyId: this.companyId,
      catalogueInConfigurations: this.selectedItems
    }
    localStorage.setItem("SampleTest", JSON.stringify(sampleTest));
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.setAttribute('target', '_blank');
    link.href = '/sample-test';
    document.body.appendChild(link);
    link.click();
    link.remove();

  }

  calculateWeightPoint(item = null) {
    this.avaragePercent.length = 0;
    var number = this.selectedItems.length;
    this.selectedItems.forEach(rank => {
      var i = 0;
      var points = rank.catalogueInRanks.map(a => a.point);
      var total = points.reduce((a, b) => a + b, 0);
      if (total == 0) total = 1;
      rank.catalogueInRanks.forEach(element => {
        element.percent = element.point / total;
        if (this.avaragePercent[i] == undefined) this.avaragePercent.push(element.percent); else this.avaragePercent[i] += element.percent;
        i++;
      });
    });

    for (let i = 0; i < this.avaragePercent.length; i++) {
      this.avaragePercent[i] = this.avaragePercent[i] / number;
    }

    for (let index = 0; index < this.listCatalogue.length; index++) {
      this.listCatalogue[index].point = this.avaragePercent[index];
    }
    this.selectedItems.forEach(rank => {
      var points = rank.catalogueInRanks.map(a => a.point);
      var sum = 0;
      for (let i = 0; i < points.length; i++) {
        sum += (points[i] * this.avaragePercent[i]);
      }
      rank.point = Math.round(sum);
    });
  }

  Create() {
    this.loading = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'The configuration will be create!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.calculateWeightPoint();

        var rankInConfig = [];
        this.selectedItems.forEach(item => {
          rankInConfig.push({
            rankId: item.rankId,
            point: item.point,
          })
        });

        var catalogueInConfiguration = [];
        this.listCatalogue.forEach(item => {
          catalogueInConfiguration.push({
            catalogueId: item.companyCatalogueId,
            weightPoint: Math.round(item.point * 100),
            numberQuestion: item.numberQuestion
          })
        });

        this.inputConfiguration['rankInConfig'] = rankInConfig;
        this.inputConfiguration['catalogueInConfiguration'] = catalogueInConfiguration;
        this.inputConfiguration['startDate'] = new Date(this.inputConfiguration['startDate']);
        this.inputConfiguration['endDate'] = new Date(this.inputConfiguration['endDate']);
        this.configAPi.createConfigurartion(this.inputConfiguration).subscribe(data => {
          this.getConfigurationIsActive(true);
          this.closeModal();
          localStorage.removeItem('SampleTest');
          this.index = 1;
          this.toast.success(data['message']);
        }, (error) => {
          this.getConfigurationIsActive(true);
          this.closeModal();
          this.index = 1;
          this.loading = false;
        });
      }
    });
  }

  Update() {
    this.loading = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'The configuration will be update!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        let request = Object.assign({}, this.updateConfig);
        if (typeof (request['startDate']) === 'string') {
          request['startDate'] = moment(request['startDate']);
        }
        if (typeof (request['endDate']) === 'string') {
          request['endDate'] = moment(request['endDate']);
        }
        this.configAPi.updateConfiguration(request).subscribe(data => {
          this.getConfigurationIsActive(true);
          this.closeModal();
          this.indexDetail = 1;
          Swal.fire('Success', 'The configuration has been updated', 'success');
        }, (error) => {
          this.toast.error(error.name);
          this.loading = false;
        });
      }
    });

  }

  DisableConfiguration(status) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'The config will be delete!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.configAPi.changeStatusConfiguration(this.selectConfiguration, status).subscribe(data => {
          this.getConfigurationIsActive(true);
          this.closeModal();
          this.toast.success(data['message']);
          this.selectConfiguration = [];
          this.selectedAll = false;
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
          this.selectedAll = false;
          this.selectConfiguration = [];
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.closeModal();
      }
    });
  }

  validateConfiguration() {
    if (this.inputConfiguration['title'] == "") {
      this.toast.error('Message', 'Please input title config');
      return false;
    }
    else if (this.inputConfiguration['title'].length > 20) {
      this.toast.error('Message', 'The maximum exam name is 20');
      return false;
    }
    else if (this.inputConfiguration['duration'] < 5 || this.inputConfiguration['duration'] > 180) {
      this.toast.error('Message', 'duration must be range ' + this.selectedItems.length * 5 + '\'' + ' to 200\'');
      return false;
    }
    else if (this.selectedItems.length === 0) {
      this.toast.error('Message', 'Please select the rank');
      return false;
    }
    else if (this.listCatalogue.length != 0) {
      for (let index = 0; index < this.listCatalogue.length; index++) {
        if (this.listCatalogue[index].numberQuestion == null) {
          this.toast.error('Message', 'Please input number of question');
          return false;
        }
        if (this.listCatalogue[index].numberQuestion < 0) {
          this.toast.error('Message', 'Please input number of question valid');
          return false;
        }
        if (this.listCatalogue[index].numberQuestion > this.listCatalogue[index].quescount) {
          this.toast.error('Message', this.listCatalogue[index].name + ' max question ' + this.listCatalogue[index].quescount);
          return false;
        }
      }
    }
  }

  sendMail(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'The mail will be send to employee!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, send it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.configAPi.sendMail(id).subscribe(data => {
          this.loading = false;
          Swal.fire('Success', 'The mail has been send', 'success');
        }, (error) => {
          this.toast.error(error.name);
          this.loading = false;
        });
      }
    },

    );
  }

  viewTest(id) {
    this.router.navigate(['/manage-test/', id]);
  }
}

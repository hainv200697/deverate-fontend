import { element } from 'protractor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StatisticApiService } from 'src/app/services/statistic-api.service';

@Component({
  selector: 'app-result',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit {
  catalogConfig = [];
  view = [550, 450];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  xAxes: [{ stacked: true }];
  showLegend = true;
  legendTitle = 'Title';
  legendPosition = 'right';
  showXAxisLabel = false;
  xAxisLabel = 'Test';
  showYAxisLabel = false;
  yAxisLabel = 'Catalogue Point';
  showGridLines = true;
  innerPadding = '5%';
  animations: boolean = true;
  barChart: any[] = [];
  series: any[] = [];
  isLoaded = false;
  load = false;
  //vertical bar chart
  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };

  multi = [];

  dataGroupChart: any;
  data = [];

  lineChartSeries: any[] = [];
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b']
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string = 'Average Point';

  rankStattistic = [];

  ngOnInit() {
    this.isLoaded = false;
    this.load = false;
    this.GetGeneralStatistic(sessionStorage.getItem("AccountId"));
    this.GetRankStatistic(sessionStorage.getItem("AccountId"));
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }

  constructor(
    private historyApi: StatisticApiService,
    private modalService: NgbModal,
  ) { }

  public loading = false;
  historyData: any;
  averageCatalogue = [];
  catalogues: [];

  GetGeneralStatistic(id) {
    this.loading = true
    this.series = [];
    this.historyApi.GetGeneralStatistic(id).subscribe(
      (data) => {
        this.historyData = data['items'];
        this.multi = [];
        var size = this.historyData[0].series.length;
        for (let i = 0; i < size; i++) {
          var series = [];
          this.historyData.forEach(element => {
            if (series.length < 5) {
              series.push({ name: element.name, value: element.series[i].value * 100 });
            }

          });
          var element = {
            name: this.historyData[0].series[i].name,
            series
          }
          this.averageCatalogue.push(element);
        }
        this.isLoaded = true;

        this.historyData.forEach(element => {
          let itemMulti = {
            name: element.name,
            series: [
              {
                name: "employees did the test ",
                value: element.numberOfFinishedTest,
              },
              {
                name: "employees didn't the test.",
                value: element.totalTest - element.numberOfFinishedTest
              }
            ]
          };
          if (this.multi.length < 5) {
            this.multi.push(itemMulti);
          }
          let itemDropdown = {
            id: element.configId,
            text: element.name,
          };
          this.dropdownList.push(itemDropdown);
        });
        this.isLoaded = true;
        this.loading = false;
      }
    );
  }

  GetRankStatistic(id) {
    this.loading = true
    this.historyApi.GetRankStatistic(id).subscribe(
      (data) => {
        this.dataGroupChart = data;

        console.log(this.dataGroupChart)
        this.load = true;
        this.loading = false;
      }
    );
  }

  onSelect(modal, evt) {
    console.log(evt);
    this.modalService.open(modal, { size: 'lg', ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }).catch((error) => {
    });
  }

  getDataStatistic(value) {
    console.log(value);
  }

  onSelectAll(value) {
    console.log(value);
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
}
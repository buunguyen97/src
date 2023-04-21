import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxDataGridComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {ActivatedRoute} from '@angular/router';
import {ReleaserequestService} from './releaserequest.service';
import {NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels} from '@techiediaries/ngx-qrcode';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-releaserequest',
  templateUrl: './releaserequest.component.html',
  styleUrls: ['./releaserequest.component.scss']
})
export class ReleaserequestComponent implements OnInit, AfterViewInit {

  @ViewChild('form1', {static: false}) form1: DxFormComponent;
  @ViewChild('form2', {static: false}) form2: DxFormComponent;
  @ViewChild('formTable', {static: false}) formTable: DxFormComponent;

  @ViewChild('grid1', {static: false}) grid1: DxDataGridComponent;
  @ViewChild('grid2', {static: false}) grid2: DxDataGridComponent;

  // 바코드
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  barcodeUrl = '';

  // Grid
  UID: string;
  dataSource1: DataSource;
  dataSource2: DataSource;
  selectedRows: number[];
  key = 'uid';
  entityStore: ArrayStore;
  entityStore2: ArrayStore;

  form1Data = {shipToName: ''};
  formTableData = {
    d1: '2021/11/03 -1',
    d2: '031-641-6700',
    d3: '126-86-56945',
    d4: '박용재',
    d5: '주식회사 알포터',
    d6: '경기도 이천시 장호원읍 나래천로 131-127',
  };

  constructor(private utilService: CommonUtilService,
              private codeService: CommonCodeService,
              private route: ActivatedRoute,
              public gridUtil: GridUtilService,
              private service: ReleaserequestService) {
    this.route.paramMap.subscribe(params => {
      this.UID = params.get('param');
    });
  }

  ngOnInit(): void {
    // 바코드 URL
    // http://!@#!@#/tenant=1000&soKey=WSO10001

    const tenant = '1000';
    const soKey = 'WSO10001';

    const domain = `http://localhost`;
    const port = `:4200`;
    const param = `?tenant=${tenant}&soKey=${soKey}`;

    this.barcodeUrl = domain + port + param;
    console.log(this.barcodeUrl);
  }

  ngAfterViewInit(): void {
    this.search();


    // const dataSource1Data = [
    //   {uid: 1, d1: '품목1', d2: '스펙1', d3: 10},
    //   {uid: 2, d1: '품목2', d2: '스펙2', d3: 40},
    //   {uid: 3, d1: '품목3', d2: '스펙3', d3: 30}
    // ];
    // const dataSource2Data = [];
    //
    // for (let i = 0; i < 30; i++) {
    //   dataSource2Data.push({uid: i, d1: 'a' + i});
    // }

    // this.form1.instance.option('formData', this.form1Data);
    // this.formTable.instance.option('formData', formTableData);
    // this.grid1.instance.option('dataSource', dataSource1Data);
    // this.grid2.instance.option('dataSource', dataSource2Data);
  }


  // grid control method
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('mm_releaseRequest1', JSON.stringify(state));
  }

  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('mm_releaseRequest1');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 이벤트 메소드
  async search(): Promise<void> {
    // Service의 조회 호출
    if (this.UID) {
      // Service의 get 함수 생성
      const result = await this.service.get({uid: this.UID});
      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.grid1.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.form1Data = result.data.shipToInfoVO;


        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        // Front에서 데이터의 CRUD를 컨트롤 할 수 있음.
        this.entityStore = new ArrayStore(
          {
            data: result.data.detailVO,
            key: this.key
          }
        );
        this.entityStore2 = new ArrayStore(
          {
            data: result.data.serialVO,
            key: this.key
          }
        );


        // ArrayStore - DataSource와 바인딩.
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dataSource1 = new DataSource({
          store: this.entityStore
        });

        this.dataSource2 = new DataSource({
          store: this.entityStore2
        });

        // 그리드 상태가 수시로 저장되어 포커스가 있을경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
        // 페이징번호도 강제로 1페이지로 Fix
        // 참고 : grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
        this.grid1.focusedRowKey = null;
        this.grid1.paging.pageIndex = 0;
      }
    } else {

    }


  }
}

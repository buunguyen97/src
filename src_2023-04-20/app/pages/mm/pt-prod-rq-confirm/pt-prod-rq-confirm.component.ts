import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {RiInstructResultVO} from '../../inv/ri-instruct-result/ri-instruct-result.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtProdRqConfirmService} from './pt-prod-rq-confirm.service';

@Component({
  selector: 'app-pt-prod-rq-confirm',
  templateUrl: './pt-prod-rq-confirm.component.html',
  styleUrls: ['./pt-prod-rq-confirm.component.scss']
})
export class PtProdRqConfirmComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  mainFormData: RiInstructResultVO = {} as RiInstructResultVO;

  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

// ***** main ***** //
  // Form
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsLocId = [];
  dsOwnerId = [];
  dsRelocateSts = [];
  dsSts = [];
  dsItemAdminId = [];
  dsItem = [];
  dsItemId = [];
  dsDamageFlg = [];
  locIdStorage = [];
  dsLocation = [];
  fromLocId = [];
  toLocId = [];

  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'uid';
  dsActFlg = [];
  dsInstructQty = [];

  PAGE_PATH = '';

  constructor(
    public utilService: CommonUtilService,
    private service: PtProdRqConfirmService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // // 조회조건 로케이션
    // this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
    //   this.dsLocation = result.data;
    //   this.dsLocId = result.data;
    // });
    //

    // 상태
    this.codeService.getCode(this.G_TENANT, 'RELOCATESTATUS').subscribe(result => {
      this.dsRelocateSts = result.data.filter(el => el.code === '10' || el.code === '900');
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

  }


  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('relocateSts').option('value', '10'); // 승인요청
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.initCode();
    this.mainForm.instance.focus();
  }


  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
          // this.toLocId = locationResult.data;
        });

        result.data.forEach(el => {
          if (el.relocateSts === '10') {
            el.relocateQty1 = el.instructQty;
          }
        });

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

      } else {
        return;
      }
    }
  }

  // 로케이션 변경(노 체크박스)
  async onExcute(): Promise<void> {
    // const changes = this.collectGridData(this.changes);
    const detailData = this.mainGrid.instance.getSelectedRowsData();

    if (this.mainGrid.instance.getSelectedRowsData().length > 0) {
      this.mainGrid.instance.saveEditData();

      for (const data of detailData) {
        let chk = true;
        this.mainGrid.instance.byKey(data.uid).then((r) => {
          if (r.relocateSts === '900') {
            chk = false;
            return;
          }
        });
        if (!chk) {
          this.utilService.notify_error('이미 완료된 이동지시입니다.');
          return;
        }

        if (data.relocateQty1 < 1) {
          this.utilService.notify_error('이동수량 값을 입력하세요.');
          return;
        }
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('executeRiInstructConfirm', '로케이션이동요청 승인'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.riInstructPerform(detailData);

      if (this.resultMsgCallback(result, 'Move')) {
        await this.mainGrid.instance.deselectAll();
        await this.onSearch();
      }

      // if (changes.length > 0) {
      //   const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('executeRiInstructConfirm', '로케이션이동요청 승인'));
      //   if (!await this.utilService.confirm(confirmMsg)) {
      //     return;
      //   }
      //   // console.log(changes);
      //   this.mainGrid.instance.saveEditData();
      //   // console.log(this.mainGrid.instance.getSelectedRowsData());  // 체크한 아이들
      //   let chk = true;
      //   for (const c of changes) {
      //     this.mainGrid.instance.byKey(c.uid).then((r) => {
      //
      //       if (r.relocateSts === '900') {
      //         chk = false;
      //         return;
      //       }
      //     });
      //   }
      //   if (!chk) {
      //     this.utilService.notify_error('이미 완료된 이동지시입니다.');
      //     return;
      //   }
      //   const result = await this.service.riInstructPerform(changes);
      //
      //   if (this.resultMsgCallback(result, 'Move')) {
      //     await this.mainGrid.instance.deselectAll();
      //     await this.onSearch();
      //   }
      // } else {
      //   this.utilService.notify_error('이동수량 값을 입력하세요.');
      //
      // }

    } else {
      this.utilService.notify_error('목록을 선택하세요.');
      return;
    }
  }

  async onReject(): Promise<void> {

    if (this.mainGrid.selectedRowKeys.length > 0) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('ExcuteRiInstructCancel', '이동지시 취소'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.reject(this.mainGrid.selectedRowKeys);

      if (this.resultMsgCallback(result, this.utilService.notify_error(this.utilService.convert1('inv_riinstructcancel_cancel', '지시취소')))) {
        this.onSearch();
      } else {
        return;
      }
    } else {
      this.utilService.notify_error(this.utilService.convert1('inv_riinstructcancel_cancelmessage', '취소할 데이터가 없습니다'));
    }

  }


  collectGridData(changes: any): any[] {
    const gridList = [];

    // tslint:disable-next-line:forin
    for (const rowIndex in changes) {
      let findRow = null;
      const idx = this.mainGrid.instance.getRowIndexByKey(changes[rowIndex].uid);
      this.mainEntityStore.byKey(changes[rowIndex].key).then(
        (dataItem) => {
          findRow = dataItem;
        },
        (error) => {
        }
      );
      gridList.push(Object.assign({
        operType: changes[rowIndex].type,
        uid: changes[rowIndex].key,
        tenant: this.G_TENANT,
        relocateId: changes[rowIndex].key,
        relocateQty1: changes[rowIndex].data.relocateQty1
      }, findRow));
    }

    return gridList;
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }


  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_riInstructResult', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_riInstructResult');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
    // this.riInstructForm.instance.getEditor('relocateKey').option('value', '');
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }
}

import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxDataGridComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { Saor180Service, Saor180VO } from './saor180.service';

@Component({
	selector: 'app-saor180',
	templateUrl: './saor180.component.html',
	styleUrls: ['./saor180.component.scss']
})
export class Saor180Component implements OnInit, AfterViewInit {

	@ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
	@ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
 
	G_TENANT: any;
	key = 'itemcategory1id';
	// Grid
	dataSource: DataSource;
	entityStore: ArrayStore;
	mainFormData: Saor180VO = {} as Saor180VO;

	dsUser = [];			// 사용자
	dsItemCategory1Id = [];	// 품목카테고리1
	
	constructor(public utilService: CommonUtilService, 
				private service: Saor180Service,
				private codeService: CommonCodeService,
				public gridUtil: GridUtilService) {
					this.G_TENANT = this.utilService.getTenant();
	}
  
	ngOnInit(): void {
		// 사용자
		this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });
		
		// 폼목카테고리1 
        this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => { this.dsItemCategory1Id = result.data; });
	}
    
    ngAfterViewInit(): void {
    	this.initForm();
    	this.utilService.getGridHeight(this.mainGrid);
  	}
  	
	// search Form 초기값 세팅
	initForm(): void {
		// 공통 조회 조건 set
		this.mainForm.instance.getEditor('outDt').option('value', this.gridUtil.getToday());
	}
	
	// 검색영역 초기화
	async onReset(): Promise<void> {
		await this.mainForm.instance.resetValues();
		await this.initForm();
	}
	
	// 메인 그리드 조회
	async onSearch(): Promise<void> {
		
		const data = this.mainForm.instance.validate();
		if (data.isValid) {
			
			this.mainFormData.outDt = this.mainFormData.outDt.replace(/-/gi,"");
			const result = await this.service.mainList(this.mainFormData);
			if (!result.success) {
				this.utilService.notify_error(result.msg);
				return;
			} else {
				this.mainGrid.instance.cancelEditData();
				this.utilService.notify_success('search success');
				this.entityStore = new ArrayStore({
					data: result.data,
					key: this.key,
				});
				
				this.dataSource = new DataSource({
					store: this.entityStore
				});
				
				this.mainGrid.focusedRowKey = null;
				this.mainGrid.paging.pageIndex = 0;
				
				var keys = this.mainGrid.instance.getSelectedRowKeys();
				this.mainGrid.instance.deselectRows(keys);
			}
		}
	}
}

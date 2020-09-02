/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as constants from '../constants';
import { WizardPageBase } from '../../wizardPageBase';
import { DeployAzureSQLVMWizard } from '../deployAzureSQLVMWizard';

export class VmSettingsPage extends WizardPageBase<DeployAzureSQLVMWizard> {

	// textbox for vm name
	private _vmNameTextBox!: azdata.InputBoxComponent;

	// textbox for vm admin username
	private _adminUsernameTextBox!: azdata.InputBoxComponent;

	// textbox for vm admin password
	private _adminPasswordTextBox!: azdata.InputBoxComponent;

	// textbox for vm admin confirm password
	private _adminComfirmPasswordTextBox!: azdata.InputBoxComponent;

	// dropdown for sql vm image
	private _vmImageDropdown!: azdata.DropDownComponent;
	private _vmImageDropdownLoader!: azdata.LoadingComponent;

	// dropdown for sql vm image sku <- sql vm image
	private _vmImageSkuDropdown!: azdata.DropDownComponent;
	private _vmImageSkuDropdownLoader!: azdata.LoadingComponent;

	// dropdown for sql vm image version <- sql vm image sku
	private _vmImageVersionDropdown!: azdata.DropDownComponent;
	private _vmImageVersionDropdownLoader!: azdata.LoadingComponent;

	// dropdown for sql vm size
	private _vmSizeDropdown!: azdata.DropDownComponent;
	private _vmSizeDropdownLoader!: azdata.LoadingComponent;

	private _form!: azdata.FormContainer;

	constructor(wizard: DeployAzureSQLVMWizard) {
		super(
			constants.VmSettingsPageTitle,
			constants.VmSettingsPageDescription,
			wizard
		);
	}

	public async initialize() {
		this.pageObject.registerContent(async (view: azdata.ModelView) => {

			await this.createVmNameTextBox(view);
			await this.createAdminUsernameTextBox(view);
			await this.createAdminPasswordTextBox(view);
			await this.createAdminPasswordConfirmTextBox(view);
			await this.createVmImageDropdown(view);
			await this.createVMImageSkuDropdown(view);
			await this.createVMImageVersionDropdown(view);
			await this.createVmSizeDropdown(view);

			this._form = view.modelBuilder.formContainer()
				.withFormItems(
					[
						{
							component: this.wizard.createFormRowComponent(view, constants.VmNameTextBoxLabel, '', this._vmNameTextBox, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmAdminUsernameTextBoxLabel, '', this._adminUsernameTextBox, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmAdminPasswordTextBoxLabel, '', this._adminPasswordTextBox, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmAdminConfirmPasswordTextBoxLabel, '', this._adminComfirmPasswordTextBox, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmImageDropdownLabel, '', this._vmImageDropdownLoader, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmSkuDropdownLabel, '', this._vmImageSkuDropdownLoader, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmVersionDropdownLabel, '', this._vmImageVersionDropdownLoader, true)
						},
						{
							component: this.wizard.createFormRowComponent(view, constants.VmSizeDropdownLabel, '', this._vmSizeDropdownLoader, true)
						}
					],
					{
						horizontal: false,
						componentWidth: '100%'
					})
				.withLayout({ width: '100%' })
				.component();


			return view.initializeModel(this._form);
		});
	}

	public async onEnter(): Promise<void> {
		this.populateVmImageDropdown();
		this.populateVmSizeDropdown();
		this.wizard.wizardObject.registerNavigationValidator((pcInfo) => {
			// if(this._vmNameTextBox.value!.match(new RegExp(''))){
			// 	this.wizard.showErrorMessage('VM name can\'t start with underscore. Can\'t end with period or hyphen.');
			// 	return false;
			// }
			// if(this._adminUsernameTextBox.value!.match(new RegExp(''))){
			// 	this.wizard.showErrorMessage('Username cannot contain special characters \/""[]:|<>+=;,?*@& or end with \'.\'');
			// 	return false;
			// }
			// if(this._adminPasswordTextBox.value!.match(new RegExp(''))){
			// 	this.wizard.showErrorMessage('Password must have 3 of the following: 1 lower case character, 1 upper case character, 1 number, and 1 special character. The value must be between 12 and 123 characters long.')
			// 	return false;
			// }
			// if(this._adminPasswordTextBox.value !== this._adminComfirmPasswordTextBox.value){
			// 	this.wizard.showErrorMessage('Password and confirm password must match.')
			// 	return false;
			// }
			// this.wizard.showErrorMessage('');
			return true;
		});
	}

	public onLeave(): void {
		this.wizard.wizardObject.registerNavigationValidator((pcInfo) => {
			return false;
		});
	}
	private async createVmNameTextBox(view: azdata.ModelView) {
		this._vmNameTextBox = view.modelBuilder.inputBox().withProperties({
		}).component();

		this._vmNameTextBox.onTextChanged((value) => {
			this.wizard.model.vmName = value;
		});
	}

	private async createAdminUsernameTextBox(view: azdata.ModelView) {
		this._adminUsernameTextBox = view.modelBuilder.inputBox().withProperties({
		}).component();

		this._adminUsernameTextBox.onTextChanged((value) => {
			this.wizard.model.vmUsername = value;
		});
	}

	private async createAdminPasswordTextBox(view: azdata.ModelView) {
		this._adminPasswordTextBox = view.modelBuilder.inputBox().withProperties({
			inputType: 'password',
		}).component();

		this._adminPasswordTextBox.onTextChanged((value) => {
			this.wizard.model.vmPassword = value;
		});
	}

	private async createAdminPasswordConfirmTextBox(view: azdata.ModelView) {
		this._adminComfirmPasswordTextBox = view.modelBuilder.inputBox().withProperties({
			inputType: 'password',
		}).component();

		this._adminComfirmPasswordTextBox.onTextChanged((value) => {
		});
	}

	private async createVmImageDropdown(view: azdata.ModelView) {
		this._vmImageDropdown = view.modelBuilder.dropDown().withProperties({
		}).component();

		this._vmImageDropdown.onValueChanged((value) => {
			this.wizard.model.vmImage = (this._vmImageDropdown.value as azdata.CategoryValue).name;
			this.populateVmImageSkuDropdown();
		});

		this._vmImageDropdownLoader = view.modelBuilder.loadingComponent().withItem(this._vmImageDropdown).component();
	}

	private async populateVmImageDropdown() {
		this._vmImageDropdownLoader.loading = true;

		let url = `https://management.azure.com` +
			`/subscriptions/${this.wizard.model.azureSubscription}` +
			`/providers/Microsoft.Compute` +
			`/locations/${this.wizard.model.azureRegion}` +
			`/publishers/MicrosoftSQLServer` +
			`/artifacttypes/vmimage/offers` +
			`?api-version=2019-12-01`;

		let response = await this.wizard.getRequest(url);

		this.wizard.addDropdownValues(
			this._vmImageDropdown,
			response.data.map((value: any) => {
				return {
					name: value.name,
					displayName: value.name
				};
			})
		);

		this.wizard.model.vmImage = (this._vmImageDropdown.value as azdata.CategoryValue).name;
		this._vmImageDropdownLoader.loading = false;
		this.populateVmImageSkuDropdown();
	}

	private async createVMImageSkuDropdown(view: azdata.ModelView) {
		this._vmImageSkuDropdown = view.modelBuilder.dropDown().withProperties({
		}).component();

		this._vmImageSkuDropdown.onValueChanged((value) => {
			this.wizard.model.vmImageSKU = (this._vmImageSkuDropdown.value as azdata.CategoryValue).name;
			this.populateVmImageVersionDropdown();
		});

		this._vmImageSkuDropdownLoader = view.modelBuilder.loadingComponent().withItem(this._vmImageSkuDropdown).component();
	}

	private async populateVmImageSkuDropdown() {
		this._vmImageSkuDropdownLoader.loading = true;
		let url = `https://management.azure.com` +
			`/subscriptions/${this.wizard.model.azureSubscription}` +
			`/providers/Microsoft.Compute` +
			`/locations/${this.wizard.model.azureRegion}` +
			`/publishers/MicrosoftSQLServer` +
			`/artifacttypes/vmimage/offers/${this.wizard.model.vmImage}` +
			`/skus?api-version=2019-12-01`;

		let response = await this.wizard.getRequest(url);

		this.wizard.addDropdownValues(
			this._vmImageSkuDropdown,
			response.data.map((value: any) => {
				return {
					name: value.name,
					displayName: value.name
				};
			})
		);

		this.wizard.model.vmImageSKU = (this._vmImageSkuDropdown.value as azdata.CategoryValue).name;
		this._vmImageSkuDropdownLoader.loading = false;
		this.populateVmImageVersionDropdown();
	}

	private async createVMImageVersionDropdown(view: azdata.ModelView) {
		this._vmImageVersionDropdown = view.modelBuilder.dropDown().withProperties({
		}).component();

		this._vmImageVersionDropdown.onValueChanged((value) => {
			this.wizard.model.vmImageVersion = (this._vmImageVersionDropdown.value as azdata.CategoryValue).name;
		});

		this._vmImageVersionDropdownLoader = view.modelBuilder.loadingComponent().withItem(this._vmImageVersionDropdown).component();
	}

	private async populateVmImageVersionDropdown() {
		this._vmImageVersionDropdownLoader.loading = true;
		let url = `https://management.azure.com` +
			`/subscriptions/${this.wizard.model.azureSubscription}` +
			`/providers/Microsoft.Compute` +
			`/locations/${this.wizard.model.azureRegion}` +
			`/publishers/MicrosoftSQLServer` +
			`/artifacttypes/vmimage/offers/${this.wizard.model.vmImage}` +
			`/skus/${this.wizard.model.vmImageSKU}` +
			`/versions?api-version=2019-12-01`;

		let response = await this.wizard.getRequest(url);

		this.wizard.addDropdownValues(
			this._vmImageVersionDropdown,
			response.data.map((value: any) => {
				return {
					name: value.name,
					displayName: value.name
				};
			})
		);

		this.wizard.model.vmImageVersion = (this._vmImageVersionDropdown.value as azdata.CategoryValue).name;
		this._vmImageVersionDropdownLoader.loading = false;
	}


	private async createVmSizeDropdown(view: azdata.ModelView) {
		this._vmSizeDropdown = view.modelBuilder.dropDown().withProperties({
			editable: true
		}).component();

		this._vmSizeDropdown.onValueChanged((value) => {
			this.wizard.model.vmSize = (this._vmImageDropdown.value as azdata.CategoryValue).name;
		});

		this._vmSizeDropdownLoader = view.modelBuilder.loadingComponent().withItem(this._vmSizeDropdown).component();
	}

	private async populateVmSizeDropdown() {
		this._vmSizeDropdownLoader.loading = true;
		let url = `https://management.azure.com` +
			`/subscriptions/${this.wizard.model.azureSubscription}` +
			`/providers/Microsoft.Compute` +
			`/locations/${this.wizard.model.azureRegion}` +
			`/vmSizes?api-version=2019-12-01`;

		let response = await this.wizard.getRequest(url);
		this._vmSizeDropdown.updateProperties({
			value: {
				name: response.data.value[0].name,
				displayName: response.data.value[0].name
			},
			values: response.data.value.map((value: any) => {
				return {
					name: value.name,
					displayName: value.name + '\tDisks:' + value.maxDataDiskCount + '\tMemory:' + (Number(value.memoryInMB) / 1024) + 'GB\tCores:' + value.numberOfCores
				};
			}),
			width: '480px'
		});
		this.wizard.model.vmSize = (this._vmSizeDropdown.value as azdata.CategoryValue).name;
		this._vmSizeDropdownLoader.loading = false;
	}


}
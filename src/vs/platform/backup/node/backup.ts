/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface ISerializedWorkspace { id: string; configURIPath: string; remoteAuthority?: string; }

export interface IBackupWorkspacesFormat {
	rootURIWorkspaces: ISerializedWorkspace[];
	folderURIWorkspaces: string[];
	emptyWorkspaceInfos: IEmptyWindowBackupInfo[];
}

export interface IEmptyWindowBackupInfo {
	backupFolder: string;
	remoteAuthority?: string;
}

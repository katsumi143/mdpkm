import { create } from 'xmlbuilder2';
import { Body } from '@tauri-apps/api/http';
import { invoke } from '@tauri-apps/api';
import { Buffer } from 'buffer';

import API from './api';
export default class MicrosoftStore {
    static soap = "http://www.w3.org/2003/05/soap-envelope";
    static secext = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
    static service = "http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService";
    static utility = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";
    static addressing = "http://www.w3.org/2005/08/addressing";
    static authorization = "http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization";

    static PRIMARY_URL = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx";
    static SECURED_URL = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured";

    static VERSIONS_URL = "https://mrarm.io/r/w10-vdb";
    static VERSIONS_URL2 = "https://raw.githubusercontent.com/MCMrARM/mc-w10-versiondb/master/versions.json.min";

    static userToken;
    static async setUserToken() {
        this.userToken = await invoke('get_microsoft_account');
    }

    static async getVersions() {
        return API.makeRequest(this.VERSIONS_URL, { forceJson: true }).catch(err => {
            console.warn(err);
            return API.makeRequest(this.VERSIONS_URL2);
        });
    }

    static async checkForVersions(cookie, knownVersions) {
        let syncResult;
        try {
            syncResult = await this.syncVersion(cookie);
        } catch(err) {
            console.error(err);
            return [];
        }

        let hasAnyNewVersions = false;
        const newUpdates = [];
        for (const update of syncResult.newUpdates) {
            const { updateId, serverId, packageMoniker } = update;
            if(!packageMoniker)
                continue;
            if(packageMoniker.startsWith('Microsoft.MinecraftUWP_') || packageMoniker.startsWith('Microsoft.MinecraftWindowsBeta_')) {
                let verified = false;
                try {
                    const result = await this.getDownloadLink(updateId, 1);
                    if(result)
                        verified = true;
                } catch(err) {
                    console.warn(err);
                    continue;
                }
                
                if(!verified)
                    continue;

                const merged = `${serverId} ${updateId} ${packageMoniker}`;
                if(knownVersions.some(v => v === updateId))
                    continue;
                console.log(`new uwp version: ${merged}`);
                hasAnyNewVersions = true;
                
                knownVersions.push(merged);
                newUpdates.push(update);
            }
        }

        if(syncResult.newCookie?.encryptedData)
            cookie = syncResult.newCookie;
        if(hasAnyNewVersions)
            return newUpdates.sort((a, b) => a.packageMoniker - b.packageMoniker);
        return [];
    }

    static async fetchCookie(configLastChanged, version) {
        const request = this.buildCookieRequest(configLastChanged, version);
        const response = await API.makeRequest(this.PRIMARY_URL, {
            body: Body.text(request),
            method: 'POST',
            headers: { 'Content-Type': 'application/soap+xml' },
            responseType: 'Text'
        });
        const data = create(response).end({ format: 'object' });
        console.log(data);

        const { Expiration, EncryptedData } = data['s:Envelope']['s:Body'].GetCookieResponse.GetCookieResult;
        return {
            expiration: Expiration,
            encryptedData: EncryptedData
        };
    }

    static async fetchConfigLastChanged() {
        const request = this.buildGetConfigRequest();
        const response = await API.makeRequest(this.PRIMARY_URL, {
            body: Body.text(request),
            method: 'POST',
            headers: { 'Content-Type': 'application/soap+xml' },
            responseType: 'Text'
        });
        const data = create(response).end({ format: 'object' });
        console.log(data);

        return data['s:Envelope']['s:Body'].GetConfigResponse.GetConfigResult.LastChange;
    }

    static async syncVersion(cookie, version) {
        const request = this.buildSyncRequest(cookie, version);
        const response = await API.makeRequest(this.PRIMARY_URL, {
            body: Body.text(request),
            method: 'POST',
            headers: { 'Content-Type': 'application/soap+xml' },
            responseType: 'Text'
        });
        const data = create(response).end({ format: 'object' });
        console.log(data);

        const result = data['s:Envelope']['s:Body'].SyncUpdatesResponse.SyncUpdatesResult;
        const updates = result.NewUpdates.UpdateInfo;
        const syncData = {
            newUpdates: updates.map(update => {
                const info = new UpdateInfo();
                info.serverId = update.ID;
                info.addXML(update.Xml);

                return info;
            })
        };

        const newCookie = result.NewCookie;
        if(newCookie)
            syncData.newCookie = {
                expiration: newCookie.Expiration,
                encryptedData: newCookie.EncryptedData
            };

        return syncData;
    }

    static buildGetConfigRequest(version) {
        const root = create({
            Envelope: {
                '@xmlns': this.soap,
                Header: {
                    '@xmlns': this.soap,
                    ...this.buildCommonHeader(this.PRIMARY_URL, 'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/GetConfig')
                },
                Body: {
                    '@xmlns': this.soap,
                    GetConfig: {
                        '@xmlns': this.service,
                        protocolVersion: {
                            '@xmlns': this.service,
                            '#': '1.81'
                        }
                    }
                }
            }
        });
        const xml = root.end({ prettyPrint: true });
        console.log(xml);
        return xml;
    }

    static buildSyncRequest(cookie, version) {
        console.log(cookie, version);
        const id = 'd25480ca-36aa-46e6-b76b-39608d49558c';
        const root = create({
            Envelope: {
                '@xmlns': this.soap,
                Header: {
                    '@xmlns': this.soap,
                    ...this.buildCommonHeader(this.PRIMARY_URL, 'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/SyncUpdates')
                },
                Body: {
                    '@xmlns': this.soap,
                    SyncUpdates: {
                        '@xmlns': this.service,
                        cookie: {
                            '@xmlns': this.service,
                            Expiration: {
                                '@xmlns': this.service,
                                '#': cookie.expiration.toString()
                            },
                            EncryptedData: {
                                '@xmlns': this.service,
                                '#': cookie.encryptedData.toString()
                            }
                        },
                        parameters: {
                            '@xmlns': this.service,
                            ExpressQuery: {
                                '@xmlns': this.service,
                                '#': 'false'
                            },
                            SkipSoftwareSync: {
                                '@xmlns': this.service,
                                '#': 'false'
                            },
                            NeedTwoGroupOutOfScopeUpdates: {
                                '@xmlns': this.service,
                                '#': 'true'
                            },
                            FilterAppCategoryIds: {
                                '@xmlns': this.service,
                                CategoryIdentifier: {
                                    '@xmlns': this.service,
                                    Id: {
                                        '@xmlns': this.service,
                                        '#': id
                                    }
                                }
                            },
                            TreatAppCategoryIdsAsInstalled: {
                                '@xmlns': this.service,
                                '#': 'true'
                            },
                            AlsoPerformRegularSync: {
                                '@xmlns': this.service,
                                '#': 'false'
                            },
                            ComputerSpec: {
                                '@xmlns': this.service,
                                '#': ''
                            },
                            ExtendedUpdateInfoParameters: {
                                '@xmlns': this.service,
                                XmlUpdateFragmentTypes: {
                                    '@xmlns': this.service,
                                    XmlUpdateFragmentType: [
                                        {
                                            '@xmlns': this.service,
                                            '#': 'Extended'
                                        }, {
                                            '@xmlns': this.service,
                                            '#': 'LocalizedProperties'
                                        }, {
                                            '@xmlns': this.service,
                                            '#': 'Eula'
                                        }
                                    ]
                                },
                                Locales: {
                                    '@xmlns': this.service,
                                    string: [
                                        {
                                            '@xmlns': this.service,
                                            '#': 'en-US'
                                        }, {
                                            '@xmlns': this.service,
                                            '#': 'en'
                                        }
                                    ]
                                }
                            },
                            ClientPreferredLanguages: {
                                '@xmlns': this.service,
                                string: {
                                    '@xmlns': this.service,
                                    '#': 'en-US'
                                }
                            },
                            ProductsParameters: {
                                '@xmlns': this.service,
                                SyncCurrentVersionOnly: {
                                    '@xmlns': this.service,
                                    '#': 'false'
                                },
                                DeviceAttributes: {
                                    '@xmlns': this.service,
                                    '#': 'E:BranchReadinessLevel=CBB&DchuNvidiaGrfxExists=1&ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&CurrentBranch=rs4_release&DataVer_RS5=1942&FlightRing=Retail&AttrDataVer=57&InstallLanguage=en-US&DchuAmdGrfxExists=1&OSUILocale=en-US&InstallationType=Client&FlightingBranchName=&Version_RS5=10&UpgEx_RS5=Green&GStatus_RS5=2&OSSkuId=48&App=WU&InstallDate=1529700913&ProcessorManufacturer=GenuineIntel&AppVer=10.0.17134.471&OSArchitecture=AMD64&UpdateManagementGroup=2&IsDeviceRetailDemo=0&HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&IsFlightingEnabled=0&DchuIntelGrfxExists=1&TelemetryLevel=1&DefaultUserRegion=244&DeferFeatureUpdatePeriodInDays=365&Bios=Unknown&WuClientVer=10.0.17134.471&PausedFeatureStatus=1&Steam=URL%3Asteam%20protocol&Free=8to16&OSVersion=10.0.17134.472&DeviceFamily=Windows.Desktop'
                                },
                                CallerAttributes: {
                                    '@xmlns': this.service,
                                    '#': 'E:Interactive=1&IsSeeker=1&Acquisition=1&SheddingAware=1&Id=Acquisition%3BMicrosoft.WindowsStore_8wekyb3d8bbwe&'
                                },
                                Products: {
                                    '@xmlns': this.service
                                }
                            },
                            ...this.buildInstalledNonLeafUpdateIDs()
                        }
                    }
                }
            }
        });
        const xml = root.end({ prettyPrint: true });
        console.log(xml);
        return xml;
    }

    static buildCookieRequest(configLastChanged, version) {
        const root = create({
            Envelope: {
                '@xmlns': this.soap,
                Header: {
                    '@xmlns': this.soap,
                    ...this.buildCommonHeader(this.PRIMARY_URL, 'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/GetCookie')
                },
                Body: {
                    '@xmlns': this.soap,
                    GetCookie: {
                        '@xmlns': this.service,
                        lastChange: {
                            '@xmlns': this.service,
                            '#': configLastChanged
                        },
                        currentTime: {
                            '@xmlns': this.service,
                            '#': new Date().toISOString()
                        },
                        protocolVersion: {
                            '@xmlns': this.service,
                            '#': '1.81'
                        }
                    }
                }
            }
        });
        const xml = root.end({ prettyPrint: true });
        console.log(xml);
        return xml;
    }

    static buildInstalledNonLeafUpdateIDs() {
        const ids = [1, 2, 3, 11, 19, 2359974, 5169044, 8788830, 23110993, 23110994, 59830006,
            59830007, 59830008, 60484010, 62450018, 62450019, 62450020, 98959022, 98959023,
            98959024, 98959025, 98959026, 129905029, 130040030, 130040031, 130040032,
            130040033, 138372035, 138372036, 139536037, 158941041, 158941042, 158941043,
            158941044,
            // ARM
            133399034, 2359977];
        return {
            InstalledNonLeafUpdateIDs: {
                '@xmlns': this.service,
                int: ids.map(id => id.toString())
            }
        };
    }

    static buildCommonHeader(url, actionName) {
        return {
            '@xmlns:p1': this.soap,
            Action: {
                '@xmlns': this.addressing,
                '@p1:mustUnderstand': '1',
                '#': actionName
            },
            MessageID: {
                '@xmlns': this.addressing,
                '#': 'urn:uuid:5754a03d-d8d5-489f-b24d-efc31b3fd32d'
            },
            To: {
                '@xmlns': this.addressing,
                '@p1:mustUnderstand': '1',
                '#': url
            },
            Security: {
                '@xmlns': this.secext,
                '@p1:mustUnderstand': '1',
                Timestamp: {
                    '@xmlns': this.utility,
                    Created: {
                        '@xmlns': this.utility,
                        '#': '2019-01-01T00:00:00.000Z'//new Date().toISOString()
                    },
                    Expires: {
                        '@xmlns': this.utility,
                        '#': '2100-01-01T00:00:00.000Z'//new Date(Date.now() + 300000).toISOString()
                    }
                },
                WindowsUpdateTicketsToken: {
                    '@xmlns': this.authorization,
                    '@xmlns:p2': this.utility,
                    '@p2:id': 'ClientMSA',
                    TicketType: [
                        /*...[this.userToken && {
                            '@Name': 'MSA',
                            '@Policy': 'MBI_SSL',
                            '@Version': '1.0',
                            User: Buffer.from(this.userToken).toString('base64')
                        }],*/
                        {
                            '@Name': 'AAD',
                            '@Policy': 'MBI_SSL',
                            '@Version': '1.0'
                        }
                    ]
                }
            }
        };
    }

    static buildDownloadLinkRequest(updateId, revision, version) {
        const root = create({
            Envelope: {
                '@xmlns': this.soap,
                'Header': {
                    '@xmlns': this.soap,
                    ...this.buildCommonHeader(
                        this.SECURED_URL,
                        'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/GetExtendedUpdateInfo2'
                    )
                },
                Body: {
                    '@xmlns': this.soap,
                    GetExtendedUpdateInfo2: {
                        '@xmlns': this.service,
                        updateIDs: {
                            '@xmlns': this.service,
                            UpdateIdentity: {
                                '@xmlns': this.service,
                                UpdateID: {
                                    '@xmlns': this.service,
                                    '#': updateId
                                },
                                RevisionNumber: {
                                    '@xmlns': this.service,
                                    '#': revision.toString()
                                }
                            }
                        },
                        infoTypes: {
                            '@xmlns': this.service,
                            XmlUpdateFragmentType: {
                                '@xmlns': this.service,
                                '#': 'FileUrl'
                            }
                        },
                        deviceAttributes: {
                            '@xmlns': this.service,
                            '#': 'E:BranchReadinessLevel=CBB&DchuNvidiaGrfxExists=1&ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&CurrentBranch=rs4_release&DataVer_RS5=1942&FlightRing=Retail&AttrDataVer=57&InstallLanguage=en-US&DchuAmdGrfxExists=1&OSUILocale=en-US&InstallationType=Client&FlightingBranchName=&Version_RS5=10&UpgEx_RS5=Green&GStatus_RS5=2&OSSkuId=48&App=WU&InstallDate=1529700913&ProcessorManufacturer=GenuineIntel&AppVer=10.0.17134.471&OSArchitecture=AMD64&UpdateManagementGroup=2&IsDeviceRetailDemo=0&HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&IsFlightingEnabled=0&DchuIntelGrfxExists=1&TelemetryLevel=1&DefaultUserRegion=244&DeferFeatureUpdatePeriodInDays=365&Bios=Unknown&WuClientVer=10.0.17134.471&PausedFeatureStatus=1&Steam=URL%3Asteam%20protocol&Free=8to16&OSVersion=10.0.17134.472&DeviceFamily=Windows.Desktop'
                        }
                    }
                }
            }
        });
        const xml = root.end({ headless: true });
        console.log(xml);
        return xml;
        return `<s:Envelope xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:s="http://www.w3.org/2003/05/soap-envelope">
            <s:Header>
                <a:Action s:mustUnderstand="1">http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/GetExtendedUpdateInfo2</a:Action>
                <a:MessageID>urn:uuid:5754a03d-d8d5-489f-b24d-efc31b3fd32d</a:MessageID>
                <a:To s:mustUnderstand="1">https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured</a:To>
                <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                    <Timestamp xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                        <Created>${new Date().toISOString()}</Created>
                        <Expires>${new Date(Date.now() + 300000).toISOString()}</Expires>
                    </Timestamp>
                    <wuws:WindowsUpdateTicketsToken wsu:id="ClientMSA" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wuws="http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization">
                        <TicketType Name="AAD" Version="1.0" Policy="MBI_SSL"></TicketType>
                    </wuws:WindowsUpdateTicketsToken>
                </o:Security>
            </s:Header>
            <s:Body>
                <GetExtendedUpdateInfo2 xmlns="http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService">
                    <updateIDs>
                        <UpdateIdentity>
                            <UpdateID>${updateId}</UpdateID>
                            <RevisionNumber>${revision}</RevisionNumber>
                        </UpdateIdentity>
                    </updateIDs>
                    <infoTypes>
                        <XmlUpdateFragmentType>FileUrl</XmlUpdateFragmentType>
                    </infoTypes>
                    <deviceAttributes>E:BranchReadinessLevel=CBB&amp;DchuNvidiaGrfxExists=1&amp;ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&amp;CurrentBranch=rs4_release&amp;DataVer_RS5=1942&amp;FlightRing=Retail&amp;AttrDataVer=57&amp;InstallLanguage=en-US&amp;DchuAmdGrfxExists=1&amp;OSUILocale=en-US&amp;InstallationType=Client&amp;FlightingBranchName=&amp;Version_RS5=10&amp;UpgEx_RS5=Green&amp;GStatus_RS5=2&amp;OSSkuId=48&amp;App=WU&amp;InstallDate=1529700913&amp;ProcessorManufacturer=GenuineIntel&amp;AppVer=10.0.17134.471&amp;OSArchitecture=AMD64&amp;UpdateManagementGroup=2&amp;IsDeviceRetailDemo=0&amp;HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&amp;IsFlightingEnabled=0&amp;DchuIntelGrfxExists=1&amp;TelemetryLevel=1&amp;DefaultUserRegion=244&amp;DeferFeatureUpdatePeriodInDays=365&amp;Bios=Unknown&amp;WuClientVer=10.0.17134.471&amp;PausedFeatureStatus=1&amp;Steam=URL%3Asteam%20protocol&amp;Free=8to16&amp;OSVersion=10.0.17134.472&amp;DeviceFamily=Windows.Desktop</deviceAttributes>
                </GetExtendedUpdateInfo2>
            </s:Body>
        </s:Envelope>`;
    }

    static async getDownloadLinks(identity, revision, version) {
        const request = this.buildDownloadLinkRequest(identity, revision, version);
        const response = await API.makeRequest(this.SECURED_URL, {
            body: Body.text(request),
            method: 'POST',
            headers: { 'Content-Type': 'application/soap+xml' },
            responseType: 'Text'
        });
        const data = create(response).end({ format: 'object' });
        console.log(data);

        return data['s:Envelope']['s:Body'].GetExtendedUpdateInfo2Response.GetExtendedUpdateInfo2Result.FileLocations.FileLocation.map(({ Url }) => ({
            url: Url.replace(/amp;/g, '')
        }));
    }

    static async getDownloadLink(identity, revision, version) {
        const links = await this.getDownloadLinks(identity, revision, version);
        return links.find(link => link.url.startsWith('http://tlu.dl.delivery.mp.microsoft.com/'))?.url;
    }
};
await MicrosoftStore.setUserToken();

class UpdateInfo {
    serverId;
    updateId;
    packageMoniker;

    addXML(value) {
        const txt = document.createElement('textarea');
        txt.innerHTML = value;

        try {
            const xml = create(`<root>${txt.value}</root>`).toObject();
            console.log(xml);

            this.updateId = xml.root.UpdateIdentity?.['@UpdateID'];
            this.packageMoniker = xml.root.ApplicabilityRules?.Metadata?.AppxPackageMetadata?.AppxMetadata?.['@PackageMoniker'];
        } catch(err) { console.warn(err); }

        txt.remove();
    }
};
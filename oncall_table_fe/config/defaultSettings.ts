import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  "navTheme": "light",
  "colorPrimary": "#722ED1",
  "layout": "mix",
  "contentWidth": "Fluid",
  "fixedHeader": false,
  "fixSiderbar": true,
  "pwa": true,
  "logo": "https://igolang.cn/icons/oncall-table.svg",
  "token": {},
  "title": "oncall-platform",
  "splitMenus": false,
  "siderMenuType": "sub"
};

export default Settings;

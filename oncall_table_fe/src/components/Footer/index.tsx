import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear}`}
      links={[
        {
          key: 'igolang.cn',
          title: 'igolang.cn',
          href: 'https://igolang.cn',
          blankTarget: true,
        },
        {
          key: 'github',
          title: 'github',
          href: 'https://github.com/YuZongYangHi',
          blankTarget: true,
        },

      ]}
    />
  );
};

export default Footer;

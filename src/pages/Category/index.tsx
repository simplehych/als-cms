import React, { useEffect } from 'react';
import ProForm, { ProFormGroup, ProFormList, ProFormText } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';

type LEAF = {
  name: string,
  flag: string,
}

type ROOT = {
  name: string,
  flag: string,
  root: ROOT[],
  leaf: LEAF[],
}

const Category: React.FC = () => {

  function randomColor(): string {
    // Math.random() 随机生成0-1的随机数，eg：0.7489584611780002
    // .toString(n) 将数字转换为 n 进制的字符串，eg：8进制/16进制/32进制
    return `#${Math.random().toString(16).substr(2, 6).toUpperCase()}`
  }

  return (
    <div>
      <h1>栏目分类</h1>
      <ProForm
        onFinish={async (e) => console.log(JSON.stringify(e))}>
        <ProFormList
          name="root"
          label="根节点"
          initialValue={[]}
          creatorButtonProps={{ creatorButtonText: '添加根节点' }}
          itemRender={({ listDom, action }, { record }) => {
            return (
              <ProCard
                bordered
                headerBordered
                collapsible
                extra={action}
                title={record?.name}
                style={{ marginBottom: 8 }}
              >
                {listDom}
              </ProCard>
            );
          }}
        >
          <ProFormGroup>
            <ProFormText name="name" placeholder="根节点名称" />
            <ProFormText name="flag" placeholder="唯一标识" />
          </ProFormGroup>

          <div style={{ marginLeft: 24, }}>
            <ProFormList
              name="leaf"
              label="子节点"
              initialValue={[]}
              copyIconProps={{ tooltipText: '复制此行到末尾', }}
              deleteIconProps={{ tooltipText: '不需要这行了', }}
              creatorButtonProps={{ creatorButtonText: '添加叶子节点' }}
            >
              <ProFormGroup>
                <ProFormText name="name" placeholder="子节点" />
                <ProFormText name="flag" placeholder="唯一标识" />
              </ProFormGroup>
            </ProFormList>

            <ProFormList
              name="root"
              label="根节点"
              initialValue={[]}
              creatorButtonProps={{ creatorButtonText: '添加根节点' }}
              itemRender={({ listDom, action }, { record }) => {
                return (
                  <ProCard
                    bordered
                    headerBordered
                    collapsible
                    extra={action}
                    title={record?.name}
                    style={{ marginBottom: 8 }}
                  >
                    {listDom}
                  </ProCard>
                );
              }}
            >
              <ProFormGroup>
                <ProFormText name="name" placeholder="根节点名称" />
                <ProFormText name="flag" placeholder="唯一标识" />
              </ProFormGroup>

              <div style={{ marginLeft: 24, }}>
                <ProFormList
                  name="leaf"
                  label="子节点"
                  initialValue={[]}
                  copyIconProps={{ tooltipText: '复制此行到末尾', }}
                  deleteIconProps={{ tooltipText: '不需要这行了', }}
                  creatorButtonProps={{ creatorButtonText: '添加叶子节点' }}
                >
                  <ProFormGroup>
                    <ProFormText name="name" placeholder="子节点" />
                    <ProFormText name="flag" placeholder="唯一标识" />
                  </ProFormGroup>
                </ProFormList>


              </div>
            </ProFormList>
          </div>
        </ProFormList>
      </ProForm>
    </div>
  );
}

export default Category;
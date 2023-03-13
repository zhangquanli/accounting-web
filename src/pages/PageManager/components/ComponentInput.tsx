import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import { ComponentInfo, ModalInfo } from "../../../constants/entity";
import ApiTransfer from "./ApiTransfer";
import DisplayColumnInput from "./DisplayColumnInput";
import styles from "./index.module.scss";
import { nanoid } from "@reduxjs/toolkit";

interface Props {
  value?: ComponentInfo[];
  onChange?: (componentInfos: ComponentInfo[]) => void;
}

const ComponentInput: React.FC<Props> = ({ value, onChange }) => {
  const [componentForm] = useForm<ComponentInfo>();
  const [componentInfos, setComponentInfos] = useState<ComponentInfo[]>([]);
  const [componentModal, setComponentModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });

  useEffect(() => {
    value && setComponentInfos(value);
  }, [value]);

  const saveComponent = async (componentInfo: ComponentInfo) => {
    let newComponents: ComponentInfo[];
    if (componentInfo.num) {
      // 修改组件
      newComponents = componentInfos.map((item) =>
        item.num === componentInfo.num ? componentInfo : item
      );
    } else {
      // 新增组件
      componentInfo.num = nanoid();
      newComponents = [...componentInfos, componentInfo];
    }
    setComponentInfos(newComponents);
    setComponentModal({ title: "", visible: false });
    onChange && onChange(newComponents);
  };

  const deleteComponent = async (componentInfo: ComponentInfo) => {
    const newComponents = componentInfos.filter(
      (item) => item.num !== componentInfo.num
    );
    setComponentInfos(newComponents);
    onChange && onChange(newComponents);
  };

  return (
    <div>
      <div>
        {componentInfos.map((item) => (
          <Tag
            key={item.num}
            className={styles.tag}
            color="blue"
            onClick={() => {
              componentForm.setFieldsValue({ ...item });
              setComponentModal({ title: "修改组件", visible: true });
            }}
            closable={true}
            onClose={() => deleteComponent(item)}
          >
            {item.name}
          </Tag>
        ))}
      </div>
      <Button
        type="dashed"
        onClick={() => {
          componentForm.resetFields();
          setComponentModal({ title: "新增组件", visible: true });
        }}
      >
        新增组件
      </Button>
      <Modal
        title={componentModal.title}
        visible={componentModal.visible}
        width={800}
        footer={null}
        onCancel={() => setComponentModal({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={componentForm}
          onFinish={saveComponent}
        >
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="num" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="组件名称"
            rules={[{ required: true, message: "请输入组件名称" }]}
          >
            <Input placeholder="请输入组件名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="组件代码"
            rules={[{ required: true, message: "请输入组件代码" }]}
          >
            <Input placeholder="请输入组件代码" />
          </Form.Item>
          <Form.Item name="displayColumns" label="关联展示字段">
            <DisplayColumnInput />
          </Form.Item>
          <Form.Item name="apiInfos" label="关联接口">
            <ApiTransfer />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComponentInput;

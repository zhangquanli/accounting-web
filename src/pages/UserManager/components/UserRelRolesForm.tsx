import React, { useEffect, useState } from "react";
import { UserRelRole } from "../../../constants/entity";
import { Button, Form, Modal, Tag } from "antd";
import { ModalInfo } from "../../../constants/type";
import RoleTreeSelect from "./RoleTreeSelect";
import PermissionCascader from "./PermissionCascader";
import styles from "./UserRelRolesForm.module.scss";

interface Props {
  value?: UserRelRole[];
  onChange?: (value: UserRelRole[]) => void;
}

const UserRelRolesForm: React.FC<Props> = ({ value, onChange }) => {
  const [userRelRoleForm] = Form.useForm<any>();
  const selectedRole = Form.useWatch("role", userRelRoleForm);

  const [userRelRoles, setUserRelRoles] = useState<UserRelRole[]>([]);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({
    title: "",
    visible: false,
  });

  useEffect(() => {
    if (value) {
      setUserRelRoles(value);
    } else {
      setUserRelRoles([]);
    }
  }, [value]);

  const saveUserRelRole = (values: any) => {
    const { role, permission } = values;
    const userRelRole = { ...permission, role };

    const contains = (userRelRole1: UserRelRole, userRelRole2: UserRelRole) => {
      return (
        userRelRole1.fullValue === userRelRole2.fullValue &&
        userRelRole1.role?.id === userRelRole2.role?.id
      );
    };
    console.log("userRelRole", userRelRole);
    const index = userRelRoles.findIndex((item) => contains(item, userRelRole));
    if (index > -1) {
      const newUserRelRoles = userRelRoles.map((item) => {
        if (contains(item, userRelRole)) {
          return userRelRole;
        } else {
          return item;
        }
      });
      setUserRelRoles(newUserRelRoles);
      onChange && onChange(newUserRelRoles);
    } else {
      const newUserRelRoles = [...userRelRoles, userRelRole];
      setUserRelRoles(newUserRelRoles);
      onChange && onChange(newUserRelRoles);
    }
    setModalInfo({ title: "", visible: false });
  };

  const deleteUserRelRole = (userRelRole: UserRelRole) => {
    const newUserRelRoles = userRelRoles.filter(
      (item) => item.value !== userRelRole.value
    );
    setUserRelRoles(newUserRelRoles);
    onChange && onChange(newUserRelRoles);
  };

  return (
    <div>
      <div>
        {userRelRoles.map((item) => (
          <Tag
            className={styles.tag}
            key={`${item.role?.id}_${item.fullValue}`}
            color="orange"
            closable={true}
            onClose={() => deleteUserRelRole(item)}
          >{`${item.role?.name}-${item.label}`}</Tag>
        ))}
      </div>
      <Button
        type="dashed"
        onClick={() => {
          userRelRoleForm.resetFields();
          setModalInfo({ title: "新增角色", visible: true });
        }}
      >
        新增角色
      </Button>
      <Modal
        title={modalInfo.title}
        visible={modalInfo.visible}
        footer={null}
        onCancel={() => setModalInfo({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={userRelRoleForm}
          onFinish={saveUserRelRole}
        >
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <RoleTreeSelect placeholder="请选择角色" />
          </Form.Item>
          <Form.Item
            name="permission"
            label="权限"
            rules={[{ required: true, message: "请选择权限" }]}
          >
            <PermissionCascader selectedRole={selectedRole} />
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

export default UserRelRolesForm;

import React, { useEffect, useState } from "react";
import { Role, UserRelRole } from "../../../constants/entity";
import { Button, Form, Modal, Tag } from "antd";
import { ModalInfo } from "../../../constants/type";
import RoleTreeSelect from "./RoleTreeSelect";
import PermissionCascader from "./PermissionCascader";

interface Props {
  value?: UserRelRole[];
  onChange?: (value: UserRelRole[]) => void;
}

const RoleInput: React.FC<Props> = ({ value, onChange }) => {
  const [roleForm] = Form.useForm<any>();
  const roleRole = Form.useWatch("role", roleForm);

  const [roles, setRoles] = useState<UserRelRole[]>([]);
  const [roleModal, setRoleModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });

  useEffect(() => {
    if (value) {
      setRoles(value);
    } else {
      setRoles([]);
    }
  }, [value]);

  const handleChange = (values: any) => {
    console.log("baocun", values);
  };

  return (
    <div>
      <div>
        {roles.map((item) => (
          <Tag>{`${item.role?.name}——${item.label}`}</Tag>
        ))}
      </div>
      <Button
        type="dashed"
        onClick={() => {
          roleForm.resetFields();
          setRoleModal({ title: "新增角色", visible: true });
        }}
      >
        新增角色
      </Button>
      <Modal
        title={roleModal.title}
        visible={roleModal.visible}
        footer={null}
        onCancel={() => setRoleModal({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={roleForm}
          onFinish={handleChange}
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
            <PermissionCascader role={roleRole} placeholder="请选择权限" />
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

function search(roles: Role[], roleId: number): Role | undefined {
  for (let role of roles) {
    const { children } = role;
    if (children && children.length > 0) {
      const current = search(children, roleId);
      if (current) {
        current.parent = role;
        return current;
      }
    }

    if (role.id === roleId) {
      return role;
    }
  }
  return undefined;
}

export default RoleInput;

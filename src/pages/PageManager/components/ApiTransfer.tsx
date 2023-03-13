import React, { useEffect, useState } from "react";
import { Transfer } from "antd";
import ajax from "../../../utils/ajax";
import { ApiInfo } from "../../../constants/entity";

interface TransferItem {
  key: string;
  title: string;
  description: string;
}

interface Props {
  value?: ApiInfo[];
  onChange?: (apiInfos: ApiInfo[]) => void;
}

const ApiTransfer: React.FC<Props> = ({ value, onChange }) => {
  const [dataSource, setDataSource] = useState<TransferItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data: ApiInfo[] = await ajax.get("/pageInfos/apiInfos");
        const newData = data.map((item) => {
          const { id, name, url, httpMethod } = item;
          return {
            key: `${id}`,
            title: `${name}-${httpMethod}-${url}`,
            description: `${name}-${httpMethod}-${url}`,
          };
        });
        setDataSource(newData);
      } catch (e) {
        console.log("接口调用失败", e);
        setDataSource([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (value) {
      const apiIds = value.map((item) => item.id + "");
      setTargetKeys([...apiIds]);
    }
  }, [value]);

  const handleChange = (newTargetKeys: string[]) => {
    setTargetKeys([...newTargetKeys]);
    const apiInfos = newTargetKeys.map((id) => {
      return { id: parseInt(id) };
    });
    onChange && onChange(apiInfos);
  };

  const handleSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  return (
    <Transfer
      showSearch={true}
      oneWay={true}
      titles={["未选中", "已选中"]}
      dataSource={dataSource}
      filterOption={(inputValue, item) => item.title?.indexOf(inputValue) > -1}
      render={(item) => item.title}
      targetKeys={targetKeys}
      onChange={handleChange}
      selectedKeys={selectedKeys}
      onSelectChange={handleSelectChange}
    />
  );
};

export default ApiTransfer;

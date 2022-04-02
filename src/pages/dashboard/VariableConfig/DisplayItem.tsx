import React, { useContext, useEffect, useState, memo } from 'react';
import { Row, Col, Input, Select, Checkbox, AutoComplete } from 'antd';
import { resourceGroupItem } from '@/store/businessInterface';
import { useTranslation } from 'react-i18next';
import { FormType } from './EditItem';
import { Variable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars, stringToRegex, extractExpressionVars } from './constant';
const { Option } = Select;
import { Range } from '@/components/DateRangePicker';
import { getVaraiableSelected } from './index';
import { RestFilled } from '@ant-design/icons';
interface Props {
  varsMap: any;
  id: string;
  expression: Variable;
  cluster: string;
  index: number;
  data: Variable[];
  range: Range;
  onChange: (index: number, value: string | string[], options?) => void;
}

const DisplayItem: React.FC<Props> = ({ expression, index, data, onChange, cluster, range, id, varsMap }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [exp, setExp] = useState<string>();
  const [_range, setRange] = useState<Range>(range);
  const [_select, setSelect] = useState<string | string[]>();
  const [curCluster, setCurCluster] = useState(cluster);
  const { definition, multi, allOption, name, reg } = expression;
  const [_allOption, setAllOption] = useState(allOption);
  const [_multi, setMulti] = useState(multi);
  const selected = getVaraiableSelected(name, id);
  const vars = extractExpressionVars(definition);
  useEffect(() => {
    if (expression && (!vars || vars.every((key) => varsMap[key]))) {
      var newExpression = replaceExpressionVars(definition, { var: data }, index, id);
      if (
        exp !== newExpression ||
        curCluster !== cluster ||
        _range !== range ||
        JSON.stringify(_select) !== JSON.stringify(selected) ||
        _multi !== multi ||
        _allOption !== allOption
      ) {
        setExp(newExpression);
        setRange(range);
        setCurCluster(cluster);
        setSelect(selected);
        setAllOption(allOption);
        setMulti(multi);
        convertExpressionToQuery(newExpression, range).then((res) => {
          // 逻辑上只有导入大盘后初始化那一次 selected会为空
          const regFilterRes = res.filter((i) => !!i && (!reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i)));
          console.log('regFilterRes', regFilterRes);
          setOptions(regFilterRes);
          if (res.length > 0) {
            if (selected) {
              if (multi && selected.length > 0) {
                let inOptionSelected;
                if (Array.isArray(selected)) {
                  inOptionSelected = selected.length === 1 && selected[0] === 'all' ? selected : selected.filter((i) => regFilterRes.includes(i));
                  onChange(index, inOptionSelected.length > 0 ? inOptionSelected : [regFilterRes[0]], regFilterRes);
                } else {
                  onChange(index, regFilterRes.includes(selected) ? [selected] : [regFilterRes[0]], regFilterRes);
                }
              } else {
                if (Array.isArray(selected)) {
                  onChange(index, regFilterRes.includes(selected[0]) ? selected[0] : regFilterRes[0], regFilterRes);
                } else {
                  onChange(index, regFilterRes.includes(selected) ? selected : regFilterRes[0], regFilterRes);
                }
              }
            } else {
              onChange(index, multi ? [regFilterRes[0]] : regFilterRes[0], regFilterRes);
            }
          }
          if (exp && newExpression && exp !== newExpression) {
            onChange(index, multi ? [] : '', regFilterRes);
          }
        });
      }
    }
  }, [expression, data, index, cluster, range, selected, multi, allOption]);

  const handleChange = (v) => {
    if (multi && allOption && v.includes('all')) {
      onChange(index, ['all'], options);
    } else if (multi && !allOption) {
      let allIndex = v.indexOf('all');
      if (allIndex !== -1) {
        v.splice(allIndex, 1);
      }
      onChange(index, v, options);
    } else {
      onChange(index, v, options);
    }
  };

  return (
    <div>
      <div className='tag-content-close-item'>
        <div className='tag-content-close-item-tagName'>{name}</div>
        <Select
          mode={multi ? 'tags' : undefined}
          style={{
            width: '180px',
          }}
          onChange={handleChange}
          defaultActiveFirstOption={false}
          showSearch
          value={selected}
          dropdownClassName='overflow-586'
        >
          {allOption && (
            <Option key={'all'} value={'all'}>
              all
            </Option>
          )}
          {options &&
            options
              // .filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i))
              .map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
        </Select>
      </div>
    </div>
  );
};

export default DisplayItem;

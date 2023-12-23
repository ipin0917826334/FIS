import React from 'react';
import { Row, Col , Flex} from 'antd';
import LineChart from './Line';
import PieChart from './Pie';
import LinePlot from './LinePlot';

const DashBoard = () => {
  return (
    <div>
<Flex wrap="wrap" gap="small">
  <div style={{width:"40%"}}>
          <PieChart />
          </div>
          <div style={{width:"50%"}}>
          <LineChart />
          </div>
  <div  style={{width:"90%"}}>
          <LinePlot />
          </div>
          </Flex>
    </div>
  );
};

export default DashBoard;

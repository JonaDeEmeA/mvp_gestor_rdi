import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { HomeIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabStandar({ onCargarFile, onCloseBrowser, onCloseRdiManager, onToggleInfoCoordenada, pickedPoint, onResetCamera }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '17vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab sx={{ color: 'gray' }} label="Archivos" {...a11yProps(0)} />
          <Tab sx={{ color: 'gray' }} label="ver" {...a11yProps(1)} />
          <Tab sx={{ color: 'gray' }} label="Herramientas" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Button size='small' variant="outlined" onClick={onCargarFile} >Cargar IFC</Button>

      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Button sx={{ fontSize: '0.675rem' }} size='small' variant="outlined" onClick={onCloseBrowser} >Explorador</Button>
        <Button size='small' variant="outlined" onClick={onCloseRdiManager} >Gestor RDI</Button>
        <Button size='small' variant="outlined" onClick={onResetCamera} >HOME 3DVIEW</Button>
       
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button size='small' variant="outlined" onClick={onToggleInfoCoordenada} >Info Coor</Button>
          {pickedPoint && (
            <Typography variant="body2" component="div">
              <strong>X:</strong> {pickedPoint.x.toFixed(2)} | <strong>Y:</strong> {pickedPoint.y.toFixed(2)} | <strong>Z:</strong> {pickedPoint.z.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CustomTabPanel>
    </Box>
  );
}

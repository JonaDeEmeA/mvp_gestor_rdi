import React from "react";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import FolderIcon from "@mui/icons-material/Folder";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from "@mui/material";



export default function Browser({ sx, listaModelos, ocultarModelo, onCloseBrowser }) {
  return (
    <Paper elevation={3} sx={{ maxWidth: 360, minHeight: 150, margin: "auto", mt: 4, ...sx }}>
      {/* Close button */}
      {onCloseBrowser && (
        <IconButton
          aria-label="close"
          onClick={onCloseBrowser}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      )}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Explorador
      </Typography>
      <List>
        {listaModelos.map((item) => (
          <ListItem key={item.object.uuid}>
            <ListItemAvatar>
              <Avatar>{item.object.name.slice(0, 3)}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={item.object.name} />
            <ListItemIcon>
              <IconButton edge="end" aria-label="delete" onClick={() => ocultarModelo(item.object.uuid)}>
                {item.object.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>

            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
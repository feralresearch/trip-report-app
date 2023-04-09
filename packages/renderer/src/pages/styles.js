const configPanel = {
  boxSizing: "border-box",
  position: "absolute",
  background: "rgb(155, 154, 154)",
  width: "100%",
  bottom: "0px",
  overflow: "hidden",
  borderTop: "7px solid rgba(0, 0, 0, 0.1)",
  height: "10rem",
  zIndex: 2
};

const sidebar = {
  boxSizing: "border-box",
  position: "absolute",
  width: "20rem",
  maxWidth: "100vw",
  boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
  overflow: "hidden",
  background: "white",
  height: "calc(100vh - 2rem)",
  padding: "1rem"
};

const mainPage = {
  boxSizing: "border-box",
  position: "absolute",
  background: "#eeeeee",
  height: "calc(99.7vh - 2rem)",
  width: "calc(100vw - 20rem)",
  left: "20rem",
  overflow: "scroll"
};

const styles = {
  wrapper: {
    position: "relative"
  },
  configPanelOpen: {
    ...configPanel,
    height: "20rem"
  },
  configPanelClosed: {
    ...configPanel,
    height: "2rem"
  },
  sidebar: {
    ...sidebar
  },
  sidebarWithConfig: {
    ...sidebar
  },
  mainPage: {
    ...mainPage
  },
  mainPageWithConfig: {
    ...mainPage
  },
  container: {
    margin: "auto",
    padding: "1rem",
    background: "white",
    height: "100vh"
  },
  list: {
    height: "calc(100vh - 14rem)",
    overflow: "scroll"
  },
  listingHeader: { background: "#eeeeee", padding: ".8rem" },
  listingBody: { padding: "1rem" },
  listing: {
    display: "flex",
    flexDirection: "column",
    margin: "0 0 0 0",
    width: "100%"
  },
  section: {
    border: "1px solid #dddddd",
    borderRadius: "5px",
    padding: "1rem",
    marginBottom: "1rem"
  },
  input: {
    appearance: "none",
    color: "#8900f2",
    background: "#eeeeee",
    margin: "1rem 0 0 0",
    width: "calc(100% - 1rem)",
    height: "2rem",
    padding: "0.5rem",
    fontSize: "1rem",
    fontWeight: 900,
    borderRadius: "0.3rem",
    border: 0
  },
  logViewer: {
    fontSize: ".7rem",
    height: "17rem",
    fontWeight: 900,
    width: "100%",
    fontFamily: "courier",
    backgroundColor: "#ffffff",
    color: "#00000094",
    boxSizing: "border-box",
    border: "1px solid #646464",
    borderRadius: "0.3rem",
    margin: "0rem 1rem 0 1rem",
    resize: "none",
    outline: "none"
  }
};
export default styles;

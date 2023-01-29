const styles = {
  wrapper: {
    position: "relative",
    top: 0,
    left: 0,
    bottom: 0,
    background: "blue"
  },
  sidebar: {
    position: "fixed",
    width: "20rem",
    maxWidth: "100vw",
    padding: "1rem",
    boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
    overflow: "hidden",
    background: "white"
  },
  mainPage: {
    position: "fixed",
    background: "#eeeeee",
    top: 0,
    height: "100vh",
    width: "calc(100vw - 25rem)",
    left: "22rem",
    margin: "0",
    padding: "1.5rem",
    overflow: "scroll"
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
  }
};
export default styles;

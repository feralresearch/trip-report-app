export default {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: ".25rem",
    minHeight: "1.5rem"
  },
  rowLabel: { fontWeight: 900, minWidth: "10rem", minHeight: "2rem" },
  gallery: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap"
  },
  galleryImgWrapper: {
    width: "150px",
    height: "100px",
    overflow: "hidden",
    margin: ".2rem"
  },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  zoomContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,.8)",
    display: "flex",
    alignItems: "center"
  },
  zoomNavbar: {
    display: "flex",
    alignItems: "center",
    padding: "2rem",
    flexDirection: "row",
    height: "3rem",
    width: "calc(100vw - 4rem)",
    position: "absolute",
    top: 0,
    fontWeight: 900,
    color: "white",
    zIndex: 5,
    background: "rgba(0, 0, 0, 0.5)"
  },
  zoomModalOverlay: {
    display: "flex",
    margin: "auto",
    padding: "3rem",
    alignItems: "center",
    position: "relative"
  },
  zoomImgWrapper: {
    position: "relative",
    boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
    maxHeight: "90vh"
  },
  zoomImg: {
    userSelect: "none",
    width: "100%",
    maxHeight: "90vh",
    boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px"
  },
  favoriteButton: {
    position: "absolute",
    top: 60,
    right: 60,
    paddingTop: ".5rem",
    zIndex: 1,
    width: "3rem",
    height: "2.5rem",
    textAlign: "center",
    color: "white",
    fontSize: "2rem"
  }
};

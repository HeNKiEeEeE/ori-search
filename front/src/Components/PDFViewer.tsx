import React from "react";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faSpinner,
  faDownload,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { withRouter, RouteComponentProps } from "react-router";
const { Document, Page, pdfjs } = require("react-pdf");
// tslint:disable-next-line:max-line-length
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface PDFViewerProps {
  url: string;
  searchTerm: string | null;
  width: number;
  setWidth: Function;
}

export interface PDFViewerState {
  numPages: null | number;
  pageNumber: number;
  // Should equal 70vw on desktops, 100vw on mobile
  maxWidth: number;
}

interface OnLoadSuccessType {
  numPages: number;
}

interface TextLayerItem {
  str: string;
}

const MARGIN_LEFT = 200;

const calcMaxWidth = (windowWidth: number) => {
  if (windowWidth > 800) {
    return windowWidth - MARGIN_LEFT;
  }

  return windowWidth;
};

const LoadingComponent = () =>
  <div className="PDFViewer__loading">
    <FontAwesomeIcon icon={faSpinner} size="6x" spin />
  </div>;

const PDFViewer = (props: PDFViewerProps & RouteComponentProps) => {
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [maxWidth] = React.useState<number>(calcMaxWidth(window.innerWidth));

  const pdfWrapper = React.createRef<HTMLInputElement>();

  const onDocumentLoadSuccess = (e: OnLoadSuccessType) => {
    setNumPages(e.numPages);
    setPageNumber(1);
  };

  const closeDocument = () => {
    const currentURL = new URL(window.location.href);
    const params = new URLSearchParams(currentURL.search);
    params.delete("showResource");
    props.history.push(`/search?${params.toString()}`);
  };

  const highlightPattern = (text: string, pattern: string): React.ReactNode => {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const matches = text.match(pattern);

    const whatever = splitText.reduce<React.ReactNode[]>(
      (arr, element, index) => {
        if (matches && matches[index]) {
          return [
            ...arr,
            element,
            <mark>
              {matches[index]}
            </mark>,
          ];
        }
        return [...arr, element];
      },
      [],
    );

    return (
      <React.Fragment>
        {whatever}
      </React.Fragment>
    );
  };

  const setFillWidth = () => {
    const PDFelements = document.getElementsByClassName("react-pdf__Page__canvas");
    if (PDFelements[0]) {
      const doc = PDFelements[0];
      const docRatio = doc.clientWidth / doc.clientHeight;
      const newWidth =  window.innerHeight * docRatio;
      if (newWidth < maxWidth) {
        props.setWidth(newWidth);
      } else {
        props.setWidth(maxWidth);
      }
    }
  };

  const makeTextRenderer = (searchText: string) =>
    (textItem: TextLayerItem) => highlightPattern(textItem.str, searchText);

  return (
    <React.Fragment>
      <Button
        className="Button__close"
        onClick={closeDocument}
      >
        Sluiten
      </Button>
      <div className="PDFViewer__scroller">
        <div id="pdfWrapper" style={{ width: "100%" }} ref={pdfWrapper}>
          <Document
            file={props.url}
            loading={<LoadingComponent/>}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              loading={null}
              pageIndex={pageNumber - 1}
              width={props.width}
              customTextRenderer={props.searchTerm && makeTextRenderer(props.searchTerm)}
            />
          </Document>
        </div>
      </div>
      <div className="PDFViewer__button-bar">
        <div className="PDFViewer__button-bar-inner">
          <Button
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={(pageNumber === 1)}
            title="Vorige pagina"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <span>{`${pageNumber} / ${numPages}`}</span>
          <Button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={(pageNumber === (numPages))}
            title="Volgende pagina"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </Button>
          <Button
            onClick={() => window.open(props.url)}
            title="Download bestand"
          >
            <FontAwesomeIcon icon={faDownload} />
          </Button>
          <Button
            onClick={setFillWidth}
            title="Scherm vullen"
          >
            <FontAwesomeIcon icon={faExpand} />
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withRouter(PDFViewer);

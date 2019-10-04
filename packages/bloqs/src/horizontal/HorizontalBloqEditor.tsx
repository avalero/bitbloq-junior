import React, { useState } from "react";
import update from "immutability-helper";
import { Icon, JuniorButton, useTranslate } from "@bitbloq/ui";
import styled from "@emotion/styled";
import BloqsLine from "./BloqsLine";
import BloqConfigPanel from "./BloqConfigPanel";
import AddBloqPanel from "./AddBloqPanel";
import BloqPropertiesPanel from "./BloqPropertiesPanel";

import { BloqCategory } from "../enums";
import {
  IBloq,
  IBloqType,
  IBloqTypeGroup,
  IComponentInstance,
  BloqParameterType,
  isBloqSelectParameter,
  isBloqSelectComponentParameter
} from "../index";

interface IHorizontalBloqEditorProps {
  bloqs: IBloq[][];
  bloqTypes: IBloqType[];
  onBloqsChange: (bloqs: IBloq[][]) => any;
  onUpload: () => any;
  getComponents: (types: string[]) => IComponentInstance[];
  getBloqPort: (bloq: IBloq) => string | undefined;
}

const HorizontalBloqEditor: React.FunctionComponent<
  IHorizontalBloqEditorProps
> = ({
  bloqs,
  bloqTypes,
  onBloqsChange,
  onUpload,
  getComponents,
  getBloqPort
}) => {
  const [selectedLineIndex, setSelectedLine] = useState(-1);
  const [selectedBloqIndex, setSelectedBloq] = useState(-1);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState(-1);

  const selectedLine = bloqs[selectedLineIndex] || [];
  const selectedBloq = selectedLine[selectedBloqIndex];

  const t = useTranslate();

  const deselectEverything = () => {
    setSelectedLine(-1);
    setSelectedBloq(-1);
    setSelectedPlaceholder(-1);
  };

  const onAddBloq = (bloqType: IBloqType) => {
    const newBloq: IBloq = {
      type: bloqType.name,
      parameters: (bloqType.parameters || []).reduce((obj, param) => {
        if (param.defaultValue) {
          obj[param.name] = param.defaultValue;
        } else {
          if (
            isBloqSelectParameter(param) &&
            param.options &&
            param.options.length > 0
          ) {
            obj[param.name] = param.options[0].value;
          }
          if (isBloqSelectComponentParameter(param)) {
            const compatibleComponents =
              getComponents(bloqType.components || []) || [];
            const { name = "" } = compatibleComponents[0] || {};
            obj[param.name] = name;
          }
          if (param.type === BloqParameterType.Number) {
            obj[param.name] = 0;
          }
          if (param.type === BloqParameterType.Text) {
            obj[param.name] = "";
          }
          if (param.type === BloqParameterType.Boolean) {
            obj[param.name] = false;
          }
        }
        return obj;
      }, {})
    };

    if (selectedLineIndex < bloqs.length) {
      onBloqsChange(
        update(bloqs, {
          [selectedLineIndex]: { $splice: [[selectedPlaceholder, 0, newBloq]] }
        })
      );
    } else {
      onBloqsChange(update(bloqs, { $push: [[newBloq]] }));
    }
    setSelectedBloq(selectedPlaceholder);
    setSelectedPlaceholder(-1);
  };

  const onUpdateBloq = (newBloq: IBloq) => {
    onBloqsChange(
      update(bloqs, {
        [selectedLineIndex]: { [selectedBloqIndex]: { $set: newBloq } }
      })
    );
  };

  const onDeleteBloq = () => {
    onBloqsChange(
      update(bloqs, {
        [selectedLineIndex]: { $splice: [[selectedBloqIndex, 1]] }
      })
    );
    deselectEverything();
  };

  return (
    <Container>
      <Lines selectedLine={selectedLineIndex} onClick={deselectEverything}>
        {[...bloqs, []].map((line, i) => (
          <Line key={i}>
            <Number>{i + 1}</Number>
            <BloqsLine
              bloqs={line}
              bloqTypes={bloqTypes}
              getBloqPort={getBloqPort}
              selectedBloq={selectedLineIndex === i ? selectedBloqIndex : -1}
              selectedPlaceholder={
                selectedLineIndex === i ? selectedPlaceholder : -1
              }
              onBloqClick={(j, e) => {
                e.stopPropagation();
                setSelectedLine(i);
                setSelectedBloq(j);
                setSelectedPlaceholder(-1);
              }}
              onPlaceholderClick={(j, e) => {
                e.stopPropagation();
                setSelectedLine(i);
                setSelectedBloq(-1);
                setSelectedPlaceholder(j);
              }}
            />
          </Line>
        ))}
      </Lines>
      <Toolbar>
        <ToolbarLeft>
          <JuniorButton secondary disabled>
            <Icon name="undo" />
          </JuniorButton>
          <JuniorButton secondary disabled>
            <Icon name="redo" />
          </JuniorButton>
        </ToolbarLeft>
        <UploadButton onClick={onUpload}>
          <Icon name="brain" />
        </UploadButton>
      </Toolbar>
      <BloqConfigPanel
        isOpen={selectedPlaceholder >= 0 || selectedBloqIndex >= 0}
        bloqTypes={bloqTypes}
        onSelectBloqType={onAddBloq}
        selectedPlaceholder={selectedPlaceholder}
        selectedBloq={selectedBloq}
        selectedBloqIndex={selectedBloqIndex}
        getBloqPort={getBloqPort}
        onUpdateBloq={onUpdateBloq}
        onDeleteBloq={onDeleteBloq}
        onClose={() => deselectEverything()}
        getComponents={getComponents}
      />
    </Container>
  );
};

export default HorizontalBloqEditor;

/* styled components */

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

interface ILinesProps {
  selectedLine: number;
}
const Lines = styled.div<ILinesProps>`
  padding: 10px;
  box-sizing: border-box;
  flex: 1;
  transform: translate(
    0,
    ${props => (props.selectedLine > 0 ? props.selectedLine * -100 : 0)}px
  );
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
`;

const Number = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #3b3e45;
  font-weight: bold;
  font-size: 32px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const Toolbar = styled.div`
  height: 72px;
  border-top: 1px solid #cfcfcf;
  padding: 10px;
  display: flex;
  box-sizing: border-box;
`;

const ToolbarLeft = styled.div`
  flex: 1;
  display: flex;
  margin: 0px -5px;

  button {
    margin: 0px 5px;
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const UploadButton = styled(JuniorButton)`
  padding: 0px 34px;
  svg {
    width: 32px;
    height: 32px;
  }
`;

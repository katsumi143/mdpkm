import Editor from '@monaco-editor/react';
import React, { useState } from 'react';

export interface JsonEditorProps {
    value: Object
}
export default function JsonEditor({ value }: JsonEditorProps) {
    const [data, setData] = useState<any>(JSON.stringify(value, null, 4));
    const [monaco, setMonaco] = useState<any>();
    const [codeEditor, setCodeEditor] = useState<editor.IStandaloneCodeEditor>();
    const onMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
        setMonaco(monaco);
        setCodeEditor(editor);
    };
    /*useEffect(() => {
        try {
            const errors = validateInstanceConfig(JSON.parse(data));
            console.log(errors);

            const model = codeEditor?.getModel();
            if (model)
                setTimeout(() => {
                    monaco?.editor.setModelMarkers(model, 'json', errors.map(text => ({
                        message: text,
                        severity: MarkerSeverity.Error,
                        endColumn: 0,
                        startColumn: 0,
                        endLineNumber: data.length,
                        startLineNumber: 0
                    })));
                }, 1000);
        } catch(err) {}
    }, [data]);*/
    return <Editor
        value={data}
        theme="vs-dark"
        onMount={onMount}
        language="json"
        onChange={setData}
        onValidate={console.log}
    />;
}
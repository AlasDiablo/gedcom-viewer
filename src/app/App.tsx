import './App.css';

import { createTree } from './createTree.ts';
import { Individual } from './type.ts';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, Box, Paper, TextField, Typography } from '@mui/material';
import { MuiFileInput } from 'mui-file-input';
import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { Tree } from 'react-d3-tree';
import { readGedcom, SelectionGedcom } from 'read-gedcom';

import type { RawNodeDatum } from 'react-d3-tree';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [gedcom, setGedcom] = useState<undefined | SelectionGedcom>(undefined);
    const [source, setSource] = useState<(Individual & { firstLetter: string }) | null>(null);

    const handleChange = (newFile: File | null) => {
        setFile(newFile);
    };

    const individuals = useMemo(() => {
        if (!gedcom) {
            return [];
        }

        const individualsRecord = gedcom.getIndividualRecord();

        const output: Individual[] = [];
        for (const individualRecord of individualsRecord.arraySelect()) {
            output.push({
                pointer: individualRecord.pointer()[0] as string,
                name: individualRecord.getName().valueNonNull()[0],
                sex: individualRecord.getSex().valueNonNull()[0],
            });
        }

        return output;
    }, [gedcom]);

    const individualOptions = useMemo(() => {
        return individuals.map((option) => {
            const firstLetter = option.name[0].toUpperCase();
            return {
                firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
                ...option,
            };
        });
    }, [individuals]);

    const gedcomTree = useMemo<undefined | RawNodeDatum>(() => {
        if (!gedcom || !source) {
            return undefined;
        }

        const tree = createTree(gedcom, source);

        console.log(tree);

        return tree;
    }, [gedcom, source]);

    useEffect(() => {
        if (!file) {
            return;
        }

        const run = async () => {
            setGedcom(readGedcom(await file.arrayBuffer()));
        };

        run().then();
    }, [file]);

    const handleSourceChange = (
        _: SyntheticEvent,
        newValue: (Individual & { firstLetter: string }) | null,
    ) => {
        setSource(newValue);
    };

    return (
        <Box margin={2}>
            <Typography variant="h2">Gedcom viewer</Typography>
            <Paper>
                <Box
                    padding={2}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Box
                        padding={2}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <MuiFileInput
                            value={file}
                            onChange={handleChange}
                            placeholder="Insert a file"
                            fullWidth
                            clearIconButtonProps={{
                                children: <CloseIcon fontSize="small" />,
                            }}
                            InputProps={{
                                startAdornment: <AttachFileIcon />,
                            }}
                        />
                        <Autocomplete
                            fullWidth
                            value={source}
                            onChange={handleSourceChange}
                            options={individualOptions.sort(
                                (a, b) => -b.firstLetter.localeCompare(a.firstLetter),
                            )}
                            groupBy={(option) => option.firstLetter}
                            getOptionLabel={(option) =>
                                `${option.name} - ${option.sex} - ${option.pointer}`
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Source Individual" />
                            )}
                        />
                    </Box>
                    <Paper>
                        <Box padding={2} height={'70vh'}>
                            {gedcomTree ? (
                                <Tree
                                    data={gedcomTree}
                                    translate={{
                                        x: 250,
                                        y: 250,
                                    }}
                                    collapsible
                                    zoomable
                                    draggable
                                    initialDepth={2}
                                    orientation="vertical"
                                />
                            ) : null}
                        </Box>
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
}

export default App;

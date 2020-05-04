/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { FormattedMessage, injectIntl } from 'react-intl';
import Settings from 'Settings';
import PropTypes from 'prop-types';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import Validation from 'AppData/Validation';

const styles = theme => ({
    FormControl: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        paddingLeft: 0,
        width: '100%',
    },
    FormControlOdd: {
        padding: theme.spacing(2),
        width: '100%',
    },
    button: {
        marginLeft: theme.spacing(1),
    },
    quotaHelp: {
        position: 'relative',
    },
    checkboxWrapper: {
        display: 'flex',
    },
    checkboxWrapperColumn: {
        display: 'flex',
        flexDirection: 'row',
    },
    group: {
        flexDirection: 'row',
    },
    removeHelperPadding: {
        '& p': {
            margin: '8px 0px',
        },
    },
});
/**
 *
 *
 * @class KeyConfiguration
 * @extends {React.Component}
 */
const KeyConfiguration = (props) => {
    const [isValidityTimeError, setValidityTimeError] = useState(false);
    const [isCalbackUrlError, setCallbackUrlError] = useState(false);
    /**
     * Get the display names for the server supported grant types
     * @param serverSupportedGrantTypes
     * @param grantTypeDisplayNameMap
     */
    const getGrantTypeDisplayList = (serverSupportedGrantTypes, grantTypeDisplayNameMap) => {
        const modifiedserverSupportedGrantTypes = {};
        serverSupportedGrantTypes.forEach((grantType) => {
            modifiedserverSupportedGrantTypes[grantType] = grantTypeDisplayNameMap[grantType];
            if (!grantTypeDisplayNameMap[grantType]) {
                modifiedserverSupportedGrantTypes[grantType] = grantType;
            }
        });
        return modifiedserverSupportedGrantTypes;
    };

    /**
     * This method is used to handle the updating of key generation
     * request object.
     * @param {*} field field that should be updated in key request
     * @param {*} event event fired
     */
    const handleChange = (field, event) => {
        const { keyRequest, updateKeyRequest, setGenerateEnabled } = props;
        const newRequest = { ...keyRequest };
        const { target: currentTarget } = event;
        let newGrantTypes = [...newRequest.supportedGrantTypes];

        switch (field) {
            case 'callbackUrl':
                if (Validation.url.validate(currentTarget.value).error) {
                    setCallbackUrlError(true);
                    setGenerateEnabled(false);
                } else {
                    setCallbackUrlError(false);
                    setGenerateEnabled(true);
                }
                newRequest.callbackUrl = currentTarget.value;
                break;
            case 'validityTime':
                if (Validation.number.validate(currentTarget.value).error) {
                    setValidityTimeError(true);
                    setGenerateEnabled(false);
                } else {
                    setValidityTimeError(false);
                    setGenerateEnabled(true);
                }
                newRequest.validityTime = currentTarget.value;
                break;
            case 'grantType':
                if (currentTarget.checked) {
                    newGrantTypes = [...newGrantTypes, currentTarget.id];
                } else {
                    newGrantTypes = newRequest.supportedGrantTypes.filter(item => item !== currentTarget.id);
                }
                setGenerateEnabled(newGrantTypes.includes('client_credentials'));
                newRequest.supportedGrantTypes = newGrantTypes;
                break;
            case 'applicationType':
                newRequest.applicationType = currentTarget.value;
                break;
            case 'authMethod':
                newRequest.authMethod = currentTarget.value;
                break;
            case 'responseType':
                newRequest.responseType = currentTarget.value;
                break;
            case 'tokenGrantType':
                newRequest.tokenGrantType = currentTarget.value;
                break;
            case 'tokenScope':
                newRequest.tokenScope = currentTarget.value;
                break;
            default:
                break;
        }
        updateKeyRequest(newRequest);
    };

    /**
     * returns whether grant type checkbox should be disabled or not
     * @param grantType
     */
    const isGrantTypeDisabled = (grantType) => {
        const { keyRequest, isUserOwner } = props;
        const { callbackUrl } = keyRequest;
        return !(isUserOwner && !(!callbackUrl && (grantType === 'authorization_code' || grantType === 'implicit')));
    };

    /**
     *
     *
     * @returns {Component}
     * @memberof KeyConfiguration
     */
    const {
        classes, keyRequest, notFound, intl, isUserOwner, isKeysAvailable,
    } = props;
    const {
        serverSupportedGrantTypes, supportedGrantTypes, callbackUrl, validityTime, applicationType, responseType, 
        authMethod, tokenGrantType, tokenScope,
    } = keyRequest;
    if (notFound) {
        return <ResourceNotFound />;
    }
    const grantTypeDisplayListMap = getGrantTypeDisplayList(
        serverSupportedGrantTypes,
        Settings.grantTypes,
    );

    return (
        <React.Fragment>
            <FormControl className={classes.FormControl} component='fieldset'>
                <InputLabel shrink htmlFor='age-label-placeholder' className={classes.quotaHelp}>
                    <FormattedMessage id='grant.types' defaultMessage='Grant Types' />
                </InputLabel>
                <div className={classes.checkboxWrapper}>
                    <div className={classes.checkboxWrapperColumn}>
                        {Object.keys(grantTypeDisplayListMap).map((key) => {
                            const value = grantTypeDisplayListMap[key];
                            return (
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            id={key}
                                            checked={!!(supportedGrantTypes
                                                    && supportedGrantTypes.includes(key))
                                                    && !isGrantTypeDisabled(key)}
                                            onChange={e => handleChange('grantType', e)}
                                            value={value}
                                            disabled={isGrantTypeDisabled(key)}
                                            color='primary'
                                        />
                                    )}
                                    label={value}
                                    key={key}
                                />
                            );
                        })}
                    </div>
                </div>
                <FormHelperText>
                    <FormattedMessage
                        defaultMessage={`The application can use the following grant types to generate 
                            Access Tokens. Based on the application requirement,you can enable or disable 
                            grant types for this application.`}
                        id='Shared.AppsAndKeys.KeyConfiguration.the.application.can'
                    />
                </FormHelperText>
            </FormControl>
            <Box display='flex'>
                <Grid item xs={10} md={5}>
                    <TextField
                        classes={{
                            root: classes.removeHelperPadding,
                        }}
                        fullWidth
                        id='callbackURL'
                        label={<FormattedMessage
                            defaultMessage='Callback URL'
                            id='Shared.AppsAndKeys.KeyConfiguration.callback.url.label'
                        />}
                        value={callbackUrl}
                        name='callbackURL'
                        onChange={e => handleChange('callbackUrl', e)}
                        margin='normal'
                        variant='outlined'
                        disabled={!isUserOwner}
                        error={isCalbackUrlError}
                        placeholder={intl.formatMessage({
                            defaultMessage: 'http://url-to-webapp',
                            id: 'Shared.AppsAndKeys.KeyConfiguration.url.to.webapp',
                        })}
                    />
                    <TextField
                        classes={{
                            root: classes.removeHelperPadding,
                        }}
                        fullWidth
                        id='applicationType'
                        label='Application Type'
                        value={applicationType}
                        name='applicationType'
                        onChange={e => handleChange('applicationType', e)}
                        margin='normal'
                        variant='outlined'
                        disabled={!isUserOwner}
                        placeholder='web'
                        required
                    />
                <TextField
                        classes={{
                            root: classes.removeHelperPadding,
                        }}
                        fullWidth
                        id='authMethod'
                        label='Token Endpoint Auth Method'
                        value={authMethod}
                        name='authMethod'
                        onChange={e => handleChange('authMethod', e)}
                        margin='normal'
                        variant='outlined'
                        disabled={!isUserOwner}
                        placeholder='client_secret_basic'
                        required
                    />
                <TextField
                        classes={{
                            root: classes.removeHelperPadding,
                        }}
                        fullWidth
                        id='tokenGrantType'
                        label='Token Grant Type'
                        value={tokenGrantType}
                        name='tokenGrantType'
                        onChange={e => handleChange('tokenGrantType', e)}
                        margin='normal'
                        variant='outlined'
                        placeholder='client_credentials'
                        disabled={!isUserOwner}
                        required
                    />
                </Grid>
                <Grid item xs={10} md={5}>
                    <Box ml={2}>
                        <TextField
                            classes={{
                                root: classes.removeHelperPadding,
                            }}
                            fullWidth
                            id='validityTime'
                            label={<FormattedMessage
                                defaultMessage='Access token validity period'
                                id='Shared.AppsAndKeys.KeyConfiguration.access.token.validity.label'
                            />}
                            value={validityTime}
                            name='validityTime'
                            onChange={e => handleChange('validityTime', e)}
                            margin='normal'
                            variant='outlined'
                            error={isValidityTimeError}
                            disabled={!isUserOwner || isKeysAvailable}
                        />

                        <TextField
                            classes={{
                                root: classes.removeHelperPadding,
                            }}
                            fullWidth
                            id='responseType'
                            label='Response Type'
                            value={responseType}
                            name='responseType'
                            onChange={e => handleChange('responseType', e)}
                            margin='normal'
                            variant='outlined'
                            disabled={!isUserOwner}
                            placeholder='code,token,id_token'
                            required
                        />
                        <TextField
                            classes={{
                                root: classes.removeHelperPadding,
                            }}
                            fullWidth
                            id='tokenScope'
                            label='Token Scope'
                            value={tokenScope}
                            name='tokenScope'
                            onChange={e => handleChange('tokenScope', e)}
                            margin='normal'
                            variant='outlined'
                            placeholder='default'
                            disabled={!isUserOwner}
                        />
                    </Box>
                </Grid>
            </Box>
        </React.Fragment>
    );
};
KeyConfiguration.defaultProps = {
    notFound: false,
};
KeyConfiguration.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    keyRequest: PropTypes.shape({
        callbackUrl: PropTypes.string,
        validityTime: PropTypes.number,
        serverSupportedGrantTypes: PropTypes.array,
        supportedGrantTypes: PropTypes.array,
    }).isRequired,
    isUserOwner: PropTypes.bool.isRequired,
    isKeysAvailable: PropTypes.bool.isRequired,
    notFound: PropTypes.bool,
    setGenerateEnabled: PropTypes.func.isRequired,
    updateKeyRequest: PropTypes.func.isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};


export default injectIntl(withStyles(styles)(KeyConfiguration));

<responseCondition>
    <responseIf>
        <and>
            <stringMatch caseSensitive="true">
                <fieldValue fieldIdentifier="exactMatch">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
                <baseValue baseType="string">1</baseValue>
            </stringMatch>
            <equal tolerance="0.000000000001" toleranceMode="absolute">
                <customOperator class="qti.customOperators.math.fraction.Numerator">
                    <fieldValue fieldIdentifier="response">
                        <variable identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
                <customOperator class="qti.customOperators.math.fraction.Numerator">
                    <fieldValue fieldIdentifier="sampleResponse">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
            </equal>
            <equal tolerance="0.000000000001" toleranceMode="absolute">
                <customOperator class="qti.customOperators.math.fraction.Denominator">
                    <fieldValue fieldIdentifier="response">
                        <variable identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
                <customOperator class="qti.customOperators.math.fraction.Denominator">
                    <fieldValue fieldIdentifier="sampleResponse">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
            </equal>
        </and>
        <setOutcomeValue identifier="SCORE">
            <sum>
                <variable identifier="SCORE"/>
                <baseValue baseType="float">{{score}}</baseValue>
            </sum>
        </setOutcomeValue>
    </responseIf>    
    <responseElseIf>
        <and>
            <stringMatch caseSensitive="true">
                <fieldValue fieldIdentifier="exactMatch">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
                <baseValue baseType="string">0</baseValue>
            </stringMatch>
            <or>
                <isNull>
                    <fieldValue fieldIdentifier="excludedValues">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </isNull>
                <not>
                    <contains>
                        <customOperator class="qti.customOperators.CsvToMultiple">
                            <fieldValue fieldIdentifier="excludedValues">
                                <correct identifier="{{responseIdentifier}}"/>
                            </fieldValue>
                        </customOperator>
                        <customOperator class="qti.customOperators.CsvToMultiple">
                            <fieldValue fieldIdentifier="response">
                                <variable identifier="{{responseIdentifier}}"/>
                            </fieldValue>
                        </customOperator>
                    </contains>
                </not>
            </or>
            <equal tolerance="0.000000000001" toleranceMode="absolute">
                <divide>
                    <customOperator class="qti.customOperators.math.fraction.Numerator">
                        <fieldValue fieldIdentifier="response">
                            <variable identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                    <customOperator class="qti.customOperators.math.fraction.Denominator">
                        <fieldValue fieldIdentifier="response">
                            <variable identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                </divide>
                <divide>
                    <customOperator class="qti.customOperators.math.fraction.Numerator">
                        <fieldValue fieldIdentifier="sampleResponse">
                            <correct identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                    <customOperator class="qti.customOperators.math.fraction.Denominator">
                        <fieldValue fieldIdentifier="sampleResponse">
                            <correct identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                </divide>
            </equal>
        </and>
        <setOutcomeValue identifier="SCORE">
            <sum>
                <variable identifier="SCORE"/>
                <baseValue baseType="float">{{score}}</baseValue>
            </sum>
        </setOutcomeValue>
    </responseElseIf>
    <responseElse>
        <setOutcomeValue identifier="SCORE">
            <baseValue baseType="float">0</baseValue>
        </setOutcomeValue>
    </responseElse>
</responseCondition>
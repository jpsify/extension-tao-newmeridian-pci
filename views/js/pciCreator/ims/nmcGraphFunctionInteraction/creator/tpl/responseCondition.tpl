<responseCondition>
    <responseIf>
        <and>
            <not>
                <isNull>
                    <fieldValue fieldIdentifier="equation">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </isNull>
            </not>
            <match>
                <fieldValue fieldIdentifier="functionGraphType">
                    <variable identifier="{{responseIdentifier}}"/>
                </fieldValue>
                <fieldValue fieldIdentifier="functionGraphType">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </match>
            <equal toleranceMode="exact">
                <customOperator class="qti.customOperators.math.graph.CountPointsThatSatisfyEquation">
                    <customOperator class="qti.customOperators.CsvToMultiple">
                        <fieldValue fieldIdentifier="points">
                            <variable identifier="{{responseIdentifier}}"/>
                        </fieldValue>
                    </customOperator>
                    <fieldValue fieldIdentifier="equation">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
                <fieldValue fieldIdentifier="numberPointsRequired">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
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
            <isNull>
                <fieldValue fieldIdentifier="equation">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </isNull>
            <match>
                <fieldValue fieldIdentifier="functionGraphType">
                    <variable identifier="{{responseIdentifier}}"/>
                </fieldValue>
                <fieldValue fieldIdentifier="functionGraphType">
                    <correct identifier="{{responseIdentifier}}"/>
                </fieldValue>
            </match>
            <match>
                <customOperator class="qti.customOperators.CsvToOrdered">
                    <fieldValue fieldIdentifier="points">
                        <variable identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
                <customOperator class="qti.customOperators.CsvToOrdered">
                    <fieldValue fieldIdentifier="samplePoints">
                        <correct identifier="{{responseIdentifier}}"/>
                    </fieldValue>
                </customOperator>
            </match>
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
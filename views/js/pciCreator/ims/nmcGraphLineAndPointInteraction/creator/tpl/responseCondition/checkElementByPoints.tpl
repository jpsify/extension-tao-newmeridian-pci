<match>
    <customOperator class="qti.customOperators.CsvToMultiple">
        <fieldValue fieldIdentifier="{{fieldIdentifier}}">
            <variable identifier="{{responseIdentifier}}"/>
		</fieldValue>
	</customOperator>
	<customOperator class="qti.customOperators.CsvToMultiple">
		<fieldValue fieldIdentifier="{{fieldIdentifier}}">
			<correct identifier="{{responseIdentifier}}"/>
		</fieldValue>
	</customOperator>
</match>